const isDev = !!(process.env.NODE_ENV === "development");

// for dev with type check
import * as config from "./config.json"
let nconfig = { ...config, isDev };

export default nconfig;