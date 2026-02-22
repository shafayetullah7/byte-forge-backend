import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoryHierarchyTable } from '@/_db/drizzle/schema/taxonomy';

@Injectable()
export class CategoryHierarchyRepository {
  constructor(private readonly db: DrizzleService) {}

  /**
   * Insert a new node into the hierarchy.
   * This involves inserting a self-referencing relationship (depth 0)
   * and linking all of the parent's ancestors to this new node.
   */
  async insertNode(tx: any, ancestorId: string | null, descendantId: string): Promise<void> {
    // 1. Insert self-reference
    await tx.insert(categoryHierarchyTable).values({
      ancestorId: descendantId,
      descendantId: descendantId,
      depth: 0,
    });

    if (ancestorId) {
      // 2. Insert relationships with all ancestors of the parent
      await tx.execute(sql`
        INSERT INTO ${categoryHierarchyTable} (ancestor_id, descendant_id, depth)
        SELECT ancestor_id, ${descendantId}, depth + 1
        FROM ${categoryHierarchyTable}
        WHERE descendant_id = ${ancestorId}
      `);
    }
  }

  /**
   * Move a node and its entire subtree to a new parent.
   */
  async moveSubtree(tx: any, nodeId: string, newParentId: string | null): Promise<void> {
    // 1. Delete all paths that connect the node's subtree to the node's old ancestors (excluding self)
    await tx.execute(sql`
      DELETE FROM ${categoryHierarchyTable}
      WHERE descendant_id IN (
        SELECT descendant_id FROM ${categoryHierarchyTable} WHERE ancestor_id = ${nodeId}
      )
      AND ancestor_id IN (
        SELECT ancestor_id FROM ${categoryHierarchyTable} WHERE descendant_id = ${nodeId} AND ancestor_id != ${nodeId}
      )
    `);

    // 2. Re-insert paths connecting the node's subtree to its new ancestors
    if (newParentId) {
      await tx.execute(sql`
        INSERT INTO ${categoryHierarchyTable} (ancestor_id, descendant_id, depth)
        SELECT supertree.ancestor_id, subtree.descendant_id, supertree.depth + subtree.depth + 1
        FROM ${categoryHierarchyTable} AS supertree
        JOIN ${categoryHierarchyTable} AS subtree ON subtree.ancestor_id = ${nodeId}
        WHERE supertree.descendant_id = ${newParentId}
      `);
    }
  }

  /**
   * Delete a node and all of its descendants from the hierarchy.
   * The actual `categories` table soft delete handles this via cascading foreign keys,
   * but if we want manual control, we can wipe the closure edges.
   */
  async deleteSubtree(tx: any, nodeId: string): Promise<void> {
     await tx.execute(sql`
      DELETE FROM ${categoryHierarchyTable}
      WHERE descendant_id IN (
        SELECT descendant_id FROM ${categoryHierarchyTable} WHERE ancestor_id = ${nodeId}
      )
    `);
  }

  /**
   * Find immediate children of a given node
   */
  async findChildren(nodeId: string) {
    return this.db.client
      .select({ childId: categoryHierarchyTable.descendantId })
      .from(categoryHierarchyTable)
      .where(and(
        eq(categoryHierarchyTable.ancestorId, nodeId),
        eq(categoryHierarchyTable.depth, 1)
      ));
  }
}
