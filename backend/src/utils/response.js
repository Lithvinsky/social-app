// FIXED: improved component structure
export function sendOk(res, data, status = 200, message = "OK") {
  return res.status(status).json({ success: true, message, data });
}

export function sendErr(res, message, status = 400, errors) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}
