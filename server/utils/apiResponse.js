function successResponse(res, statusCode, message, data = {}) {
    return res.status(statusCode).json({
      status: "success",
      code: statusCode,
      message,
      data,
    });
  }
  
  function errorResponse(res, statusCode, message, data = {}) {
    return res.status(statusCode).json({
      status: "error",
      code: statusCode,
      message,
      data,
    });
  }
  
  module.exports = { successResponse, errorResponse };
  