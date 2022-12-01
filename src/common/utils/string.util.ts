export const validPhoneTest = (str: string): boolean => {
  return /^1(3|4|5|7|8)\d{9}$/.test(str);
};

export const ifNumber = (char: string): boolean => {
  return /\d/.test(char);
};

export const findPhoneNumbers = (str: string): string[] => {
  let toTest = '';
  let foundPhoneNum = '';

  if (!str.length) {
    return [];
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (ifNumber(char)) {
      toTest = str.slice(i, i + 11);
      if (validPhoneTest(toTest)) {
        if (ifNumber(str[i - 1]) || ifNumber(str[i + 11])) {
          // 过滤
          continue;
        }
        foundPhoneNum = toTest;

        return [foundPhoneNum, ...findPhoneNumbers(str.slice(i + 11))];
      }
    }
  }

  return [];
};

export const cleanSymbols = (str: string): string => {
  return str
    .replace(/[\r\n]/g, '')
    .replace(/[：]/g, ':')
    .replace(/[；]/g, ';')
    .replace(/[。]/g, '.')
    .replace(/[”]/g, '"')
    .replace(/[“]/g, '"')
    .replace(/[，]/g, ',');
};
