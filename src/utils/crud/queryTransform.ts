let transform2 = {
  ">=": v => ({ $gte: v.slice(2) }),
  "<=": v => ({ $lte: v.slice(2) })
}

let transform1 = {
  ">": v => ({ $gt: v.slice(1) }),
  "<": v => ({ $lt: v.slice(1) }),
  "!": v => ({ $ne: v.slice(1) }),
  ",": v => ({ $in: v.slice(1).split(",") }),
  "@": v => RegExp(v.slice(1), "i"),
};

function transformValue(value) {
  if (typeof value != "string") return value;
  return transform2[value.slice(0, 2)]?.(value) ?? transform1[value[0]]?.(value) ?? value;
}


export function defaultMongooseQueryTransform(query) {
  let nq = {}
  for (let key in query) {
    nq[key] = transformValue(query[key])
  }
  return nq;
}