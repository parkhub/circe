export default function timestampMiddleware(params, next) {
  const publishParams = Object.assign({}, params);
  const { timestamp } = publishParams;

  publishParams.timestamp = timestamp || Date.now();

  return next(publishParams);
}
