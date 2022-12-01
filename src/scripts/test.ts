import { VaisalaClient } from '../common/helpers/vaisala.helper';
import { AliCloudClient } from '../common/helpers/aliyun.helper';
import config from '../configs/config';
(async () => {
  const vConfig = config().vaisala;
  const aConfig = config().aliyun;

  const client = VaisalaClient.getInstance(vConfig);

  const aliyun = AliCloudClient.getInstance(aConfig);

  // const sms =
  //   'SMS text: "[226961] 日期: 2022-11-24 18:20:57\n位置/区域: REF040(-80℃)/viewLinc/SZND/生物分析部/6F-A604\n阈值条件:高高阈值 > -70.00 °C\n阈值警报：阈值警报/-67.92 °C - 2022-11-24 18:20:03+08:00\n" sent.';

  // const sms =
  //   'SMS text: "[225319] 日期: 2022-11-23 19:08:43\n位置/区域: REF035(-80℃)/viewLinc/SZND/生物分析部/1F-M121\n阈值条件:高高阈值 > -70.00 °C\n阈值重复警报:/-69.71 °C - 2022-11-23 19:07:52+08:00" sent.';

  const sms =
    'SMS text: "[225343] 重复消息:设备 “SHLG-SHFL-127” 的 2022-11-23 18:53:54+08:00 上有通信警报.\n设备描述:SHLG-SHFL-127\n设备序列号/位置/主机:22242181/DL 数据记录仪: 66/FLSZN-TMS01.Frontage.com\n因此，以下位置不可用:viewLinc/SHLG/1F-127(通用制备室)/RH01-127 (106744), viewLinc/SHLG/1F-127(通用制备室)/RT01-127 (106993)\n警报消息:" sent.';

  // const sms =
  //   'SMS text: "[225319] 日期/位置/区域: 2022-11-23 19:27:54/REF035(-80℃)/viewLinc/SZND/生物分析部/1F-M121\n阈值条件:高高阈值 > -70.00 °C\n已恢复正常:-70.01 °C-2022-11-23 19:27:53+08:00" sent.';

  // const sms =
  //   'SMS text: "[225350] 设备 “SHLG-SHFL-134” 的 2022-11-23 18:53:54+08:00 上有通信警报。\n设备描述/主机:SHLG-SHFL-134/FLSZN-TMS01.Frontage.com\n因此，以下位置不可用:viewLinc/SHLG/1F-134(天平室)/RT01-134 (106771), viewLinc/SHLG/1F-134(天平室)/RH01-134 (106772)\n警报消息：" sent.';

  const successMsg = client.parseSuccessMsg(sms);

  const template = client.findTemplate(successMsg);
  console.log(template);
  const params = client.generateSMSParams(
    successMsg,
    '2022-12-31 13:32:42+08:00',
    template,
  );

  if (params.length) {
    for (const item of params) {
      await aliyun.sendSmsReq({
        phoneNumbers: '15953217093',
        signName: '罗德仪器',
        templateCode: template.templateCode,
        templateParam: item,
      });
    }
  } else {
    await aliyun.sendSmsReq({
      phoneNumbers: '15953217093',
      signName: '罗德仪器',
      templateCode: template.templateCode,
      templateParam: params,
    });
  }

  console.log(template, params);
})();
