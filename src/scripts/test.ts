// (async () => {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   const { CookieJar, fetch } = (await eval(
//     `import('node-fetch-cookies')`,
//   )) as typeof import('node-fetch-cookies');

//   const cookieJar = CookieJar;

//   console.log(cookieJar);

//   // log in to some api
//   let response = await fetch(cookieJar, 'https://example.com/api/login', {
//     method: 'POST',
//     body: 'credentials',
//   });

//   // do some requests you require login for
//   response = await fetch(
//     cookieJar,
//     'https://example.com/api/admin/drop-all-databases',
//   );

//   //  and optionally log out again
//   response = await fetch('https://example.com/api/logout');
// })();

// import { validPhoneTest, findPhoneNumbers } from '../common/utils/string.util';

// const origin =
//   '1jh123hah1-90327:ds jajlh8215588600150, 13605201371123asj123L13905208651.a123jdfaj*(*&!32 d&(1- 23';

// const phoneNums = findPhoneNumbers(origin);

// console.log(phoneNums);
