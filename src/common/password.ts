import * as bcrypt from 'bcrypt';
export const hashPassword = async (text: string) => {
  const saltOrRounds = 10;
  const hash = await bcrypt.hash(text, saltOrRounds);
  return hash;
};

export const comparePassword = async (text: string, hash: string) => {
  const isValid = await bcrypt.compare(text, hash);
  return isValid;
};
