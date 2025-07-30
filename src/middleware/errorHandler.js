export const errorHandler = (err, req, res, next) => {
  console.error('Xato:', err.message);
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Serverda xato yuz berdi';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: errorMessage,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
};