export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(msg = 'Yêu cầu không hợp lệ', details?: unknown) {
    return new ApiError(400, msg, details)
  }
  static unauthorized(msg = 'Chưa xác thực') {
    return new ApiError(401, msg)
  }
  static forbidden(msg = 'Không có quyền') {
    return new ApiError(403, msg)
  }
  static notFound(msg = 'Không tìm thấy') {
    return new ApiError(404, msg)
  }
  static conflict(msg = 'Dữ liệu đã tồn tại') {
    return new ApiError(409, msg)
  }
}
