export const fileSchema = {
  url: String,
};
export const imageSchema = {
  ...fileSchema,
  width: Number,
  height: Number
};