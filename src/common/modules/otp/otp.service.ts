import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { HashingService } from '../hashing/hashing.service';
import { otpTable, TOtp } from '@/_db/drizzle/schema';
import { OtpPurpose } from '@/_db/drizzle/enum/otp.purpose.enum';
import { and, eq, gt } from 'drizzle-orm';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '../response/dto/error.schema';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 15;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly hashingService: HashingService,
  ) {}

  /**
   * Generate a 6-digit numeric OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and store a hashed OTP for a user
   */
  async createOtp(userId: string, purpose: OtpPurpose): Promise<{ otp: string; expiresAt: Date }> {
    const otp = this.generateOtp();
    const hashedOtp = await this.hashingService.hash(otp);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Use transaction to handle race conditions
    await this.drizzle.client.transaction(async (tx) => {
      // Delete any existing OTP for this user and purpose
      await tx
        .delete(otpTable)
        .where(and(eq(otpTable.userId, userId), eq(otpTable.purpose, purpose)));

      // Create new OTP (unique constraint ensures only one exists)
      await tx.insert(otpTable).values({
        userId,
        hashedOtp,
        purpose,
        expiresAt,
      });
    });

    return { otp, expiresAt }; // Return plain OTP and expiry
  }

  /**
   * Verify an OTP for a user
   */
  async verifyOtp(
    userId: string,
    otp: string,
    purpose: OtpPurpose,
  ): Promise<boolean> {
    if (!/^\d+$/.test(otp)) {
       throw new CustomException({
          message: 'OTP must contain only digits',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_ERROR,
       });
    }

    // Use transaction to prevent race conditions
    return await this.drizzle.client.transaction(async (tx) => {
      // Find and lock the OTP record
      const [otpRecord] = await tx
        .select()
        .from(otpTable)
        .where(
          and(
            eq(otpTable.userId, userId),
            eq(otpTable.purpose, purpose),
            gt(otpTable.expiresAt, new Date()),
          ),
        )
        .limit(1)
        .for('update'); // Lock the row to prevent concurrent access

      if (!otpRecord) {
        throw new CustomException({
          message: 'Invalid or expired OTP',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.INVALID_OTP,
        });
      }

      // Verify OTP
      const isValid = await this.hashingService.compare(
        otp,
        otpRecord.hashedOtp,
      );

      if (!isValid) {
        throw new CustomException({
          message: 'Invalid OTP',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.INVALID_OTP,
        });
      }

      // Delete the OTP after successful verification
      await tx.delete(otpTable).where(eq(otpTable.id, otpRecord.id));

      return true;
    });
  }
}
