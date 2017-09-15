export default function checkParamsMiddleware(params, next) {
  const publishParams = Object.assign({}, params);
  const { topic, message } = publishParams;

  if (!topic || !message) {
    const missingProp = !topic ? 'topic' : 'message';

    throw new Error(`${missingProp} is required`);
  }

  return next(publishParams);
}
