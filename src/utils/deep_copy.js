export default function recursiveCopy(obj) {
  if (obj instanceof Array) {
    return obj.map((item) => recursiveCopy(item));
  }
  if (obj instanceof Object) {
    const newObj = {};
    Object.keys(obj).map((key) => {
      newObj[key] = recursiveCopy(obj[key]);
    });
    return newObj;
  }
  return obj;
}
