module.exports = newFn=> (req, res, next) => {
    Promise.resolve(newFn(req, res, next)).catch(next);
};