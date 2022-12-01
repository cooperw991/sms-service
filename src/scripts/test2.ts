import { VaisalaClient } from '../common/helpers/vaisala.helper';
import { AliCloudClient } from '../common/helpers/aliyun.helper';
import config from '../configs/config';
(async () => {
  const { CookieJar, fetch } = (await eval(
    `import('node-fetch-cookies')`,
  )) as typeof import('node-fetch-cookies');
  const cookieJar = new CookieJar();
  console.log(1, cookieJar);

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  const res = await fetch(cookieJar, `https://flszn-tms01/__login__`, {
    body: `username=jiqi&password=Fron@888`,
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`请求失败！Http code: ${res.status}`);
  }

  const res2 = await fetch(
    cookieJar,
    `https://flszn-tms01/json/api-events_query`,
    {
      body: ``,
      method: 'POST',
    },
  );

  console.log(res2.text());
})();
