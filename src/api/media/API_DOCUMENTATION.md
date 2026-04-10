# Media API Module Documentation

## Base Path
All endpoints in this module are prefixed with `/v1/media`.

> [!IMPORTANT]
> All endpoints require user authentication via the `UserAuthGuard` (session cookie).

---

## 1. Media Upload
**Controller**: `MediaController`  

### `POST /v1/media/upload`
Uploads a single image or video file. The file passes through size constraints and mime-type validation.

- **Authentication**: Required (`UserAuthGuard`)
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Request Body / Form Data**:
  - `file`: The media file to be uploaded.
- **Constraints**:
  - Max File Size: `3MB`
  - Allowed Types: Restricted by `AllowedMimeType` enum (e.g., standard image/video arrays). If invalid, returns `400 BadRequestException`.
- **Response**:
  ```json
  {
    "status": 201,
    "message": "File uploaded successfully",
    "data": {
      // Returned media entity details (URL, metadata, etc.)
    }
  }
  ```

---

## 2. Media Deletion

### `DELETE /v1/media/:id`
Deletes a specific media file by its ID, provided it belongs to the authenticated user.

- **Authentication**: Required (`UserAuthGuard`)
- **Path Parameters**:
  - `id` (string): The unique identifier of the media to delete (validated as `DeleteMediaDto`).
- **Response**:
  - **Status Code**: `204 No Content`

---

## 3. Retrieve User Media

### `GET /v1/media`
Retrieves all media files uploaded by the currently authenticated user.

- **Authentication**: Required (`UserAuthGuard`)
- **Response**:
  - **Status Code**: `200 OK`
  - **Body**: Array of media entities belonging to the user.
