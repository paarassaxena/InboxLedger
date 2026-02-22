console.log("React OAuth module inspection");
try {
  const req = require('@react-oauth/google/dist/index.js');
  console.log(Object.keys(req));
} catch (e) {
  console.log("CJS not available, module is likely ESM");
}
