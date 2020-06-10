import * as bcrypt from 'bcrypt';

export async function bcrypt_hash(password){
  return new Promise((s, e) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) e(err)
      else s(hash)
    })
  });
}

export async function bcrypt_compare(password,hash){
  return new Promise((s, e) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) e(err)
      else s(result)
    })
  });
}