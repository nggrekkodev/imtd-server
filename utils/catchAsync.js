// Wrapper function to prevent writing try catch for each async function. Wrap the async function
const catchAsync = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = catchAsync;
