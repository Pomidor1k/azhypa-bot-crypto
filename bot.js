const { Telegraf, Markup } = require("telegraf");
const LocalSession = require("telegraf-session-local");
const messages = require("./messages");
const keyboards = require("./keyboards");
const mainDb = require("./dataBases/firebase");
const functions = require("./functions");
const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api');

const webAppUrl = "https://azhypa-web.onrender.com";
//6664007271:AAGIYnU3pxOwTXgzuNylrqZRWRWw6dl39Ao
const bot = new Telegraf("6664007271:AAGIYnU3pxOwTXgzuNylrqZRWRWw6dl39Ao");
const cryptoPayToken = '160624:AA5WhTeiwoQSBLtWhVi2cj3PFwqTacZAltN';
const cryptoPay = new CryptoPay(cryptoPayToken);
const localSession = new LocalSession({ database: "session_db.json" });
bot.use(localSession.middleware());

const paymentLinks = {
  basic: "https://mel.store/azhypa/27002",
  advanced: "https://mel.store/azhypa/27001",
  pro: "https://mel.store/azhypa/26997",
  "advanced-pro": "https://mel.store/azhypa/27004",
  "basic-advanced": "https://mel.store/azhypa/27008",
  "basic-pro": "https://mel.store/azhypa/27010",
};

const TenMinTimer = 600000; //!поменять на 10 мин
const upgradeTimeout = 82800000; //!поменять на 23 часа
const deleteUpgradeTimeout = 3600000; //!поменять на один час

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.username ? ctx.from.username : "none";
  const currentTime = await functions.getCurrentTime();

  ctx.session.userName = userName;
  ctx.session.timeOut1 = true;
  ctx.session.timeOut2 = true;
  ctx.session.timeOut3 = true;
  ctx.session.timeOut4 = true;
  ctx.session.timeOut5 = true;
  ctx.session.timeOut6 = true;
  ctx.session.timeOut7 = true;
  ctx.session.timeOut8 = true;
  ctx.session.timeOut9 = true;
  ctx.session.canStartMessage = false;

      //!убрать клавиатуру в другой файл
      const ratesDescriptionWithVideoMessageKeyboard = Markup.keyboard([
        Markup.button.webApp(
          "Выбрать тариф🎁",
          `${webAppUrl}/choose-rate?userId=${userId}`
        ),
      ])
        .resize()
        .oneTime();

  try {
    await ctx.replyWithPhoto(
      { source: "./assets/images/welcome.jpg" },
      {
        protect_content: true,
        parse_mode: "HTML",
        caption: messages.welcomeMessage.ru,
        ...keyboards.welcomeMessageKeyboard,
      }
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }

  try {
    await mainDb.createUserDocument(userId, userName, currentTime);
  } catch (error) {
    console.error(error);
    setTimeout(async () => {
      await mainDb.createUserDocument(userId, userName, currentTime);
    }, 90000000);
  }

  setTimeout(async () => {
    if (ctx.session.timeOut1) {
      try {
        await ctx.replyWithVideo({source: './assets/images/promo.mp4'}, {
          protect_content: true,
          caption: messages.ratesDescriptionWithVideoMessage.ru,
        })
      } catch (error) {
        console.error(error);
      }
    }

    setTimeout(async () => {
      if (ctx.session.timeOut2) {
        try {
          await ctx.replyWithVideo(
            { source: "./assets/images/adv_video.mp4" },
            {
              protect_content: true,
              parse_mode: "HTML",
              caption: messages.ratesDescriptionWithVideoMessage.ru,
              ...ratesDescriptionWithVideoMessageKeyboard, //!убрать клавиатуру в другой файл
            }
          );
        } catch (error) {
          console.error(error);
        }

        setTimeout(async () => {
          if (ctx.session.timeOut4) {
            try {
              await ctx.replyWithVideo({source: './assets/special_offers/vid_1.mp4'}, {
                protect_content: true,
                caption: messages.needHelpChoosingRateMessage.ru,
                parse_mode: 'HTML',
                ...ratesDescriptionWithVideoMessageKeyboard
              })
            } catch (error) {
              console.error(error);
            }
          }
        }, TenMinTimer);
      }
    }, TenMinTimer);
  }, TenMinTimer);
});

// const ignoreEvents = ["photo", "video", "voice", "document"];

// bot.on(ignoreEvents, async (ctx, next) => {});

const broadcastEvents = ["photo", "video", "voice", "document"];

bot.on(broadcastEvents, async (ctx) => {
  if (String(ctx.from.id) === '689818355' || String(ctx.from.id) === '514751965') {
    ctx.session.broadcastMessageId = ctx.message.message_id
    // Создаем inline клавиатуру
    const inlineKeyboard = Markup.inlineKeyboard([
      Markup.button.callback('начать рассылку', 'start_broadcast'),
      Markup.button.callback('отмена', 'cancel')
    ]);

    // Пересылаем сообщение обратно пользователю с inline клавиатурой
    await ctx.telegram.sendCopy(ctx.from.id, ctx.message, inlineKeyboard);
  }
});

// Обработчики кнопок
bot.action('start_broadcast', async (ctx) => {
  let users = await mainDb.getAllUsers()
  users.forEach(async user => {
    await ctx.telegram.forwardMessage(user, ctx.chat.id, ctx.session.broadcastMessageId);
  })
  ctx.session.broadcastMessageId = ""
});

bot.action('cancel', async (ctx) => {
  ctx.session.broadcastMessageId = ""
  await ctx.deleteMessage()
});


bot.action("welcomeMessage-prePaymentVideoAdvMessage", async (ctx) => {

  
  //!убрать клавиатуру в другой файл

  const userId = ctx.from.id;
  ctx.session.timeOut1 = false;

  const ratesDescriptionWithVideoMessageKeyboard = Markup.keyboard([
    Markup.button.webApp(
      "Выбрать тариф🎁",
      `${webAppUrl}/choose-rate?userId=${userId}`
    ),
  ])
    .resize()
    .oneTime();

  try {
    ctx.editMessageReplyMarkup(null);
  } catch (error) {
    console.error(error);
  }

  try {

    await ctx.replyWithVideo({source: './assets/images/promo.mp4'}, {
      protect_content: true,
      caption: messages.ratesDescriptionWithVideoMessage.ru,
      ...ratesDescriptionWithVideoMessageKeyboard
    })
  } catch (error) {
    console.error(error);
  }

  setTimeout(async () => {
    if (ctx.session.timeOut2) {
      try {
        await ctx.replyWithVideo(
          { source: "./assets/images/adv_video.mp4" },
          {
            protect_content: true,
            parse_mode: "HTML",
            caption: messages.ratesDescriptionWithVideoMessage.ru,
            ...ratesDescriptionWithVideoMessageKeyboard, //!убрать клавиатуру в другой файл
          }
        );
      } catch (error) {
        console.error(error);
      }

      setTimeout(async () => {
        if (ctx.session.timeOut4) {
          try {
            await ctx.replyWithVideo({source: './assets/special_offers/vid_1.mp4'}, {
              protect_content: true,
              caption: messages.needHelpChoosingRateMessage.ru,
              parse_mode: 'HTML',
              ...ratesDescriptionWithVideoMessageKeyboard
            })
          } catch (error) {
            console.error(error);
          }
        }
      }, TenMinTimer);
    }
  }, TenMinTimer);
});


bot.command('admin', async (ctx) => {
  if (String(ctx.from.id) === '689818355' || String(ctx.from.id) === '514751965') {
    try {
      let usersInfo = await mainDb.getAdminUsersInfo()
      await ctx.replyWithHTML(`<b>Информация о пользователях</b>\n\n<b>Количество пользователей:</b>   ${usersInfo.usersAmount}\n\n<b>Количество оплат:</b>   ${usersInfo.paymentsAmount}\n\n<b>Пользователи BASIC:</b>   ${usersInfo.basicUsersAmount}\n\n<b>Пользователи ADVANCED:</b>   ${usersInfo.advancedUsersAmount}\n\n<b>Пользователи PRO:</b>   ${usersInfo.proUsersAmount}\n\n<b>Ожидают сессию:</b>   ${usersInfo.waitingForSessionAmount}
      `)
    } catch (error) {
      await ctx.replyWithHTML("Ошибка получения данных")
    }
  }
})




bot.action(
  "prePaymentVideoAdvMessage-authorInfoWithPicMessage",
  async (ctx) => {
    const userId = ctx.from.id;
    ctx.session.timeOut2 = false;

    try {
      await ctx.replyWithPhoto(
        { source: "./assets/images/author_info.jpg" },
        {
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.authorInfoWithPicMessage.ru,
        }
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    //!убрать клавиатуру в другой файл
    const ratesDescriptionWithVideoMessageKeyboard = Markup.keyboard([
      Markup.button.webApp(
        "Выбрать тариф🎁",
        `${webAppUrl}/choose-rate?userId=${userId}`
      ),
    ])
      .resize()
      .oneTime();

    setTimeout(async () => {
      try {
        await ctx.replyWithHTML(
          messages.authorInfoWithoutPicMessage.ru,
          keyboards.authorInfoWithoutPicMessageKeyboard
        );

        setTimeout(async () => {
          if (ctx.session.timeOut3) {
            try {
              await ctx.replyWithVideo(
                { source: "./assets/images/adv_video.mp4" },
                {
                  protect_content: true,
                  parse_mode: "HTML",
                  caption: messages.ratesDescriptionWithVideoMessage.ru,
                  ...ratesDescriptionWithVideoMessageKeyboard, //!убрать клавиатуру в другой файл
                }
              );
            } catch (error) {
              console.error(error);
            }

            setTimeout(async () => {
              if (ctx.session.timeOut4) {
                try {
                  await ctx.replyWithVideo({source: './assets/special_offers/vid_1.mp4'}, {
                    protect_content: true,
                    caption: messages.needHelpChoosingRateMessage.ru,
                    parse_mode: 'HTML',
                    ...ratesDescriptionWithVideoMessageKeyboard
                  })
                } catch (error) {
                  console.error(error);
                }
              }
            }, TenMinTimer);
          }
        }, TenMinTimer);
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }
    }, 5000);
  }
);

bot.action(
  [
    "prePaymentVideoAdvMessage-ratesDescriptionWithVideoMessage",
    "authorInfoWithoutPicMessage-ratesDescriptionWithVideoMessage",
  ],
  async (ctx) => {
    const userId = ctx.from.id;
    ctx.session.timeOut2 = false;
    ctx.session.timeOut3 = false;

    //!убрать клавиатуру в другой файл
    const ratesDescriptionWithVideoMessageKeyboard = Markup.keyboard([
      Markup.button.webApp(
        "Выбрать тариф🎁",
        `${webAppUrl}/choose-rate?userId=${userId}`
      ),
    ])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithVideo(
        { source: "./assets/images/adv_video.mp4" },
        {
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.ratesDescriptionWithVideoMessage.ru,
          ...ratesDescriptionWithVideoMessageKeyboard, //!убрать клавиатуру в другой файл
        }
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    setTimeout(async () => {
      if (ctx.session.timeOut4) {
        try {
          await ctx.replyWithVideo({source: './assets/special_offers/vid_1.mp4'}, {
            protect_content: true,
            caption: messages.needHelpChoosingRateMessage.ru,
            parse_mode: 'HTML',
            ...ratesDescriptionWithVideoMessageKeyboard
          })
        } catch (error) {
          console.error(error);
        }
      }
    }, TenMinTimer);
  }
);

bot.on("web_app_data", async (ctx) => {
  const userId = ctx.from.id;
  const data = ctx.webAppData.data.json();

  if (data.webAppType === "choose-rate") {
    ctx.session.userRate = data.rateLevel;
    ctx.session.timeOut4 = false;

    const paymentLinkMessageKeyboard = Markup.keyboard([
      ["Оплатить картой💳"],
      ["Оплатить криптой💎"],
      ["Задать вопрос❓"]
    ])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithHTML(
        messages.paymentLinkMessage.ru,
        paymentLinkMessageKeyboard
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    try {
      await mainDb.updateUserParameter(
        userId,
        "userRate",
        ctx.session.userRate
      );
    } catch (error) {
      console.error(error);
      setTimeout(async () => {
        await mainDb.updateUserParameter(
          userId,
          "userRate",
          ctx.session.userRate
        );
      }, 90000000);
    }

    const paymentIssuesMessageKeyboard = Markup.keyboard([
      ["ТЫ КТО чтоб так базарить?😡"],
      ["Не в этом дело🙃"],
      [
        Markup.button.webApp(
          "Получить доступ🔑",
          `${webAppUrl}/check_primary_payment?userId=${userId}`
        ),
      ],
    ])
      .resize()
      .oneTime();
    setTimeout(async () => {
      if (ctx.session.timeOut5) {
        await ctx.replyWithVideo({source: './assets/special_offers/vid_2.mp4'}, {
          protect_content: true,
          parse_mode: 'HTML',
          caption: messages.paymentIssuesMessage.ru,
          paymentIssuesMessageKeyboard
        })
      }
    }, TenMinTimer);
  } else if (data.webAppType === "primary-payment") {
    ctx.session.timeOut1 = false;
    ctx.session.timeOut2 = false;
    ctx.session.timeOut3 = false;
    ctx.session.timeOut4 = false;
    ctx.session.timeOut5 = false;
    ctx.session.timeOut6 = false;
    try {
      await ctx.replyWithPhoto(
        { source: "./assets/images/successPayment.jpg" },
        {
          protect_content: true,
          reply_markup: { remove_keyboard: true },
        }
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    setTimeout(async () => {
      try {
        await ctx.replyWithPhoto(
          { source: "./assets/images/lesson1.jpg" },
          {
            protect_content: true,
            parse_mode: "HTML",
            caption: messages.firstLessonVideoIntroMessage.ru,
            ...keyboards.firstLessonVideoIntroKeyboard,
          }
        );
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }
    }, 2000);

    const firstLessonTestStartKeyboard = Markup.keyboard([
      [
        Markup.button.webApp(
          "Проверить знания📝",
          `${webAppUrl}/test-one?userId=${userId}`
        ),
      ],
    ])
      .resize()
      .oneTime();

    setTimeout(async () => {
      await ctx.replyWithPhoto(
        { source: "./assets/images/test1.jpg" },
        {
          disable_notification: true,
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.firstLessonTestStartMessage.ru,
          ...firstLessonTestStartKeyboard,
        }
      );
    }, 10000);

    try {
      await mainDb.updateUserAfterPaymentInfo(
        userId,
        data.userEmail,
        data.userPhone,
        data.userName,
        data.paymentPrice,
        data.productId
      );
    } catch (error) {
      console.error(error);
      setTimeout(async () => {
        await mainDb.updateUserAfterPaymentInfo(
          userId,
          data.userEmail,
          data.userPhone,
          data.userName,
          data.paymentPrice,
          data.productId
        );
      }, 90000000);
    }
  } else if (
    data.webAppType === "test-one-passed" ||
    data.webAppType === "test-one-skipped"
  ) {
    if (data.webAppType === "test-one-passed") {
      try {
        await mainDb.updateUserTests(
          userId,
          "userFirstTestPassed",
          true,
          "userFirstTestSkipped",
          false,
          "userFirstTestAttempts",
          data.testAttempts
        );
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.updateUserTests(
            userId,
            "userFirstTestPassed",
            true,
            "userFirstTestSkipped",
            false,
            "userFirstTestAttempts",
            data.testAttempts
          );
        }, 90000000);
      }
    } else if (data.webAppType === "test-one-skipped") {
      try {
        await mainDb.updateUserTests(
          userId,
          "userFirstTestPassed",
          false,
          "userFirstTestSkipped",
          true,
          "userFirstTestAttempts",
          data.testAttempts
        );
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.updateUserTests(
            userId,
            "userFirstTestPassed",
            false,
            "userFirstTestSkipped",
            true,
            "userFirstTestAttempts",
            data.testAttempts
          );
        }, 90000000);
      }
    }

    try {
      await ctx.replyWithSticker(
        "CAACAgIAAxkBAAEC-5tlrPIYP3qiZYDaeQrmNfABQJOJCAAC_gADVp29CtoEYTAu-df_NAQ",
        {
          protect_content: true,
          reply_markup: { remove_keyboard: true },
        }
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    setTimeout(async () => {
      await ctx.replyWithPhoto(
        { source: "./assets/images/lesson2.jpg" },
        {
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.secondLessonVideoIntroMessage.ru,
          ...keyboards.secondLessonVideoIntroKeyboard,
        }
      );
    }, 2000);

    const secondLessonTestStartKeyboard = Markup.keyboard([
      [Markup.button.webApp("Проверить знания📝", `${webAppUrl}/test-two`)],
    ])
      .resize()
      .oneTime();

    setTimeout(async () => {
      await ctx.replyWithPhoto(
        { source: "./assets/images/test2.jpg" },
        {
          disable_notification: true,
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.secondLessonTestStartMessage.ru,
          ...secondLessonTestStartKeyboard,
        }
      );
    }, 10000);
  } else if (
    data.webAppType === "test-two-passed" ||
    data.webAppType === "test-two-skipped"
  ) {
    if (data.webAppType === "test-two-passed") {
      try {
        await mainDb.updateUserTests(
          userId,
          "userSecondTestPassed",
          true,
          "userSecondTestSkipped",
          false,
          "userSecondTestAttempts",
          data.testAttempts
        );
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.updateUserTests(
            userId,
            "userSecondTestPassed",
            true,
            "userSecondTestSkipped",
            false,
            "userSecondTestAttempts",
            data.testAttempts
          );
        }, 90000000);
      }
    } else if (data.webAppType === "test-two-skipped") {
      try {
        await mainDb.updateUserTests(
          userId,
          "userSecondTestPassed",
          false,
          "userSecondTestSkipped",
          true,
          "userSecondTestAttempts",
          data.testAttempts
        );
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.updateUserTests(
            userId,
            "userFirstTestPassed",
            false,
            "userFirstTestSkipped",
            true,
            "userFirstTestAttempts",
            data.testAttempts
          );
        }, 90000000);
      }
    }

    try {
      await ctx.replyWithSticker(
        "CAACAgIAAxkBAAEC-5tlrPIYP3qiZYDaeQrmNfABQJOJCAAC_gADVp29CtoEYTAu-df_NAQ",
        {
          protect_content: true,
          reply_markup: { remove_keyboard: true },
        }
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    const route = {
      basic: "fnIHBIbihbd2h",
      advanced: "dmoJNHK8hin",
      pro: "hiYB8ygibrgg",
    };

    const thirdLessonProAdvancedIntroKeyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          "Смотреть видео🖥",
          `${webAppUrl}/${route[ctx.session.userRate]}`
        ),
      ],
    ]);

    setTimeout(async () => {
      await ctx.replyWithPhoto(
        { source: "./assets/images/lesson3.jpg" },
        {
          protect_content: true,
          parse_mode: "HTML",
          caption:
            ctx.session.userRate === "basic"
              ? messages.thirdLessonBasicIntroMessage.ru
              : messages.thirdLessonProAdvancedIntroMessage.ru,
          ...thirdLessonProAdvancedIntroKeyboard,
        }
      );
    }, 2000);

    setTimeout(async () => {
      try {
        if (ctx.session.userRate === "basic") {
          await ctx.replyWithDocument(
            { source: "./assets/images/formula1.png" },
            {
              protect_content: true,
              ...keyboards.getAccessToChatKeyboard,
            }
          );
        } else {
          const watchBonusVideoKeyboard = Markup.inlineKeyboard([
            [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/amfjxu9HInd`)],
          ]);

          setTimeout(async () => {
            await ctx.replyWithPhoto(
              { source: "./assets/images/bonus.jpg" },
              {
                protect_content: true,
                caption: messages.bonusLessonMessage.ru,
                ...watchBonusVideoKeyboard,
              }
            );
          }, 30000);
          setTimeout(async () => {
            await ctx.replyWithDocument(
              { source: "./assets/images/formula2.png" },
              {
                protect_content: true,
                disable_notification: true,
                ...keyboards.getAccessToChatKeyboard,
              }
            );
          }, 30000);
        }
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }
    }, 5000);
  } else if (data.webAppType === "session-register") {
    const currentTime = await functions.getCurrentTime();
    try {
      await mainDb.updateUserPersonalAnswersInfo(
        userId,
        data.userAnswName,
        data.userAnswInst,
        data.userAnswWhoAreYou,
        data.userAnswAim,
        data.userAnswAimRealize,
        data.userAnswWeaknesses,
        data.userAnswClient,
        currentTime
      );
    } catch (error) {
      console.error(error);
      setTimeout(async () => {
        await mainDb.updateUserPersonalAnswersInfo(
          userId,
          data.userAnswName,
          data.userAnswInst,
          data.userAnswWhoAreYou,
          data.userAnswAim,
          data.userAnswAimRealize,
          data.userAnswWeaknesses,
          data.userAnswClient,
          currentTime
        );
      }, 90000000);
    }

    try {
      await ctx.replyWithHTML(messages.proAdvancedFinalMessage.ru, {
        reply_markup: { remove_keyboard: true },
      });
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.proAdvancedFinalMessage.ru, {
        reply_markup: { remove_keyboard: true },
      });
    }
  } else if (data.webAppType === "advanced-pro") {
    if (String(data.productId) === "27004") {
      ctx.session.timeOut7 = false;
      ctx.session.timeOut8 = false;
      const signUpForSessionIntroKeyboard = Markup.keyboard([
        [
          Markup.button.webApp(
            "Записаться на сессию✍️",
            `${webAppUrl}/session-register`
          ),
        ],
      ])
        .resize()
        .oneTime();

      try {
        await ctx.replyWithHTML(
          messages.advancedUpgradeSuccessPaymentMessage.ru,
          signUpForSessionIntroKeyboard
        );
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }

      try {
        await mainDb.updateUserParameter(userId, "userUpgradedAdvToPro", true);
      } catch (error) {}
    }
  } else if (data.webAppType === "basic-advanced") {
    const fourthLessonBasicIntroKeyboard = Markup.inlineKeyboard([
      [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/iougBIBi7bhb`)],
    ]);

    if (String(data.productId) === "27008") {
      try {
        await ctx.replyWithSticker(
          "CAACAgIAAxkBAAEC-5tlrPIYP3qiZYDaeQrmNfABQJOJCAAC_gADVp29CtoEYTAu-df_NAQ",
          {
            protect_content: true,
            reply_markup: { remove_keyboard: true },
          }
        );
      } catch (error) {
        console.error(error);
      }

      try {
        await ctx.replyWithPhoto(
          { source: "./assets/images/lesson4.jpg" },
          {
            protect_content: true,
            caption: messages.basicUpgradeToAdvancedLessonFourIntroMessage.ru,
            ...fourthLessonBasicIntroKeyboard,
          }
        );
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }

      try {
        await mainDb.updateUserParameter(
          userId,
          "userUpgradedBasToAdvanced",
          true
        );
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.updateUserParameter(
            userId,
            "userUpgradedBasToAdvanced",
            true
          );
        }, 90000000);
      }

      setTimeout(async () => {
        const watchBonusVideoKeyboard = Markup.inlineKeyboard([
          [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/amfjxu9HInd`)],
        ]);

        try {
          setTimeout(async () => {
            await ctx.replyWithPhoto(
              { source: "./assets/images/bonus.jpg" },
              {
                protect_content: true,
                caption: messages.bonusLessonMessage.ru,
                ...watchBonusVideoKeyboard,
              }
            );
          }, 30000);
          setTimeout(async () => {
            await ctx.replyWithDocument(
              { source: "./assets/images/formula2.png" },
              {
                protect_content: true,
              }
            );

            try {
              await ctx.replyWithHTML(
                messages.basicUpgradeToAdvancedFinalMessage.ru
              );
            } catch (error) {
              console.error(error);
              await ctx.replyWithHTML(messages.techProblemsMessage.ru);
            }
          }, 30000);
        } catch (error) {
          console.error(error);
          await ctx.replyWithHTML(messages.techProblemsMessage.ru);
        }
      }, 10000);
    }
  } else if (data.webAppType === "basic-pro") {
    const fourthLessonBasicIntroKeyboard = Markup.inlineKeyboard([
      [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/aon9UHD89fhk`)],
    ]);

    if (String(data.productId) === "27010") {
      try {
        await ctx.replyWithSticker(
          "CAACAgIAAxkBAAEC-5tlrPIYP3qiZYDaeQrmNfABQJOJCAAC_gADVp29CtoEYTAu-df_NAQ",
          {
            protect_content: true,
            reply_markup: { remove_keyboard: true },
          }
        );
      } catch (error) {
        console.error(error);
      }

      try {
        await ctx.replyWithPhoto(
          { source: "./assets/images/lesson4.jpg" },
          {
            protect_content: true,
            caption: messages.basicUpgradeToProLessonFourIntroMessage.ru,
            ...fourthLessonBasicIntroKeyboard,
          }
        );
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }

      try {
        await mainDb.updateUserParameter(userId, "userUpgradedBasToPro", true);
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.updateUserParameter(
            userId,
            "userUpgradedBasToPro",
            true
          );
        }, 90000000);
      }

      setTimeout(async () => {
        const watchBonusVideoKeyboard = Markup.inlineKeyboard([
          [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/amfjxu9HInd`)],
        ]);

        try {
          setTimeout(async () => {
            await ctx.replyWithPhoto(
              { source: "./assets/images/bonus.jpg" },
              {
                protect_content: true,
                caption: messages.bonusLessonMessage.ru,
                ...watchBonusVideoKeyboard,
              }
            );
          }, 30000);
          setTimeout(async () => {
            await ctx.replyWithDocument(
              { source: "./assets/images/formula2.png" },
              {
                protect_content: true,
                disable_notification: true,
              }
            );

            const signUpForSessionIntroKeyboard = Markup.keyboard([
              [
                Markup.button.webApp(
                  "Записаться на сессию✍️",
                  `${webAppUrl}/session-register`
                ),
              ],
            ])
              .resize()
              .oneTime();

            try {
              await ctx.replyWithHTML(
                messages.signUpForSessionIntroMessage.ru,
                signUpForSessionIntroKeyboard
              );
            } catch (error) {
              console.error(error);
              await ctx.replyWithHTML(messages.techProblemsMessage.ru);
            }
          }, 30000);
        } catch (error) {
          console.error(error);
          await ctx.replyWithHTML(messages.techProblemsMessage.ru);
        }
      }, 10000);
    }
  }
});

bot.hears("Оплатить картой💳", async (ctx) => {
  const userId = ctx.from.id

  const checkPrimaryPaymentKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check_primary_payment`
      ),
    ],
    ["Выбрать способ оплаты◀️"]
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithPhoto({source: './assets/images/card.jpg'}, {
      protect_content: true,
      parse_mode: 'HTML',
      caption: `Твоя ссылка для оплаты\n\n${paymentLinks[ctx.session.userRate]}`,
      ...checkPrimaryPaymentKeyboard
    })
  } catch (error) {
    
  }
})

bot.hears("Выбрать способ оплаты◀️", async (ctx) => {
  const paymentLinkMessageKeyboard = Markup.keyboard([
    ["Оплатить картой💳"],
    ["Оплатить криптой💎"],
    ["Задать вопрос❓"]
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithHTML(
      messages.paymentLinkMessage.ru,
      paymentLinkMessageKeyboard
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }
})

bot.hears("Оплатить криптой💎", async (ctx) => {
  const userId = ctx.from.id

  const currencyKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('USDT', 'usdt')],
    [Markup.button.callback('TON', 'ton')],
    [Markup.button.callback('BTC', 'btc')],
    [Markup.button.callback('ETH', 'eth')],
    [Markup.button.callback('Назад', 'primaryCryptoBack')]
]);

  try {
    await ctx.replyWithHTML(`Выберите удобную валюту:`, currencyKeyboard)
} catch (error) {
    console.error("Error:", error.message);
}
})

bot.action('primaryCryptoBack', async (ctx) => {
  const userId = ctx.from.id
  const userRate = ctx.session.userRate
  await ctx.deleteMessage()
  const paymentLinkMessageKeyboard = Markup.keyboard([
    ["Оплатить картой💳"],
    ["Оплатить криптой💎"],
    ["Задать вопрос❓"]
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithHTML(
      messages.paymentLinkMessage.ru,
      paymentLinkMessageKeyboard
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }
})

const currenciesArray = ['usdt', 'ton', 'btc', 'eth']

bot.action(currenciesArray, async (ctx) => {
  const userRate = ctx.session.userRate
  let ratePrice = {
    'basic': 39,
    'advanced': 68,
    'pro': 89
  }
  let convertedPrice = ''

  const userId = ctx.from.id
  const chosenCurrency = ctx.callbackQuery.data
  const exchangeObjArray = await cryptoPay.getExchangeRates()
  exchangeObjArray.forEach(currencyObj => {
    if (chosenCurrency === 'usdt') {
      if (currencyObj.source === 'USDT' && currencyObj.target === 'USD') {
        convertedPrice = String((ratePrice[userRate] / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'ton') {
      if (currencyObj.source === 'TON' && currencyObj.target === 'USD') {
        convertedPrice = String((ratePrice[userRate] / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'btc') {
      if (currencyObj.source === 'BTC' && currencyObj.target === 'USD') {
        convertedPrice = String((ratePrice[userRate] / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'eth') {
      if (currencyObj.source === 'ETH' && currencyObj.target === 'USD') {
        convertedPrice = String((ratePrice[userRate] / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    }
  })

  const asset = {
    'usdt': Assets.USDT,
    'ton': Assets.TON,
    'btc': Assets.BTC,
    'eth': Assets.ETH
  }

  const invoice = await cryptoPay.createInvoice(asset[chosenCurrency], convertedPrice, {
    description: `Подписка ${userRate}`,
    paid_btn_name: PaidButtonNames.OPEN_BOT,
    paid_btn_url: 'https://t.me/proIevel_bot',
    payload: userId,
  });

  ctx.session.primaryInvoiceId = invoice.invoice_id

  const cryptoPaymentKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Оплатить', `${invoice.pay_url}`)],
    [Markup.button.callback('Проверить оплату', `checkPrimaryCryptoPayment`)]
]);

 
  await ctx.replyWithPhoto({source: './assets/images/crypto.jpg'}, {
    parse_mode: 'HTML',
    protect_content: true,
    caption: `Детали заказа:\n\nТовар: <b>Подписка ${ctx.session.userRate}</b>\n\nСтоимость: <b>${convertedPrice} ${chosenCurrency}</b>\n\nПосле оплаты нажмите кнопку "Проверить оплату"`,
    ...cryptoPaymentKeyboard
  })
})


bot.action("checkPrimaryCryptoPayment", async (ctx) => {
  const userId = ctx.from.id

  try {
    const invoiceStatus = await cryptoPay.getInvoices({invoice_ids: String(ctx.session.primaryInvoiceId)});
    const status = invoiceStatus.items[0].status
    
    if (status === 'paid' || userId === 689818355 || userId === 514751965) {
      try {
        await mainDb.updateUserParameter(userId, "userPayment", true)
      } catch (error) {
        
      }
      ctx.session.timeOut1 = false;
      ctx.session.timeOut2 = false;
      ctx.session.timeOut3 = false;
      ctx.session.timeOut4 = false;
      ctx.session.timeOut5 = false;
      ctx.session.timeOut6 = false;
      try {
        await ctx.replyWithPhoto(
          { source: "./assets/images/successPayment.jpg" },
          {
            protect_content: true,
            reply_markup: { remove_keyboard: true },
          }
        );
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }
  
      setTimeout(async () => {
        try {
          await ctx.replyWithPhoto(
            { source: "./assets/images/lesson1.jpg" },
            {
              protect_content: true,
              parse_mode: "HTML",
              caption: messages.firstLessonVideoIntroMessage.ru,
              ...keyboards.firstLessonVideoIntroKeyboard,
            }
          );
        } catch (error) {
          console.error(error);
          await ctx.replyWithHTML(messages.techProblemsMessage.ru);
        }
      }, 2000);
  
      const firstLessonTestStartKeyboard = Markup.keyboard([
        [
          Markup.button.webApp(
            "Проверить знания📝",
            `${webAppUrl}/test-one?userId=${userId}`
          ),
        ],
      ])
        .resize()
        .oneTime();
  
      setTimeout(async () => {
        await ctx.replyWithPhoto(
          { source: "./assets/images/test1.jpg" },
          {
            disable_notification: true,
            protect_content: true,
            parse_mode: "HTML",
            caption: messages.firstLessonTestStartMessage.ru,
            ...firstLessonTestStartKeyboard,
          }
        );
      }, 10000);
    }

  } catch (error) {
    console.error(error);
  }
})

bot.hears("Задать вопрос❓", async (ctx) => {
  const userId = ctx.from.id;

  const paymentLinkMessageKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check_primary_payment?userId=${userId}`
      ),
    ],
    ["Задать вопрос❓"],
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithHTML(
      messages.needHelpMessage.ru,
      paymentLinkMessageKeyboard
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }
});

bot.hears("ТЫ КТО чтоб так базарить?😡", async (ctx) => {
  const userId = ctx.from.id;

  const paymentLinkMessageKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check_primary_payment?userId=${userId}`
      ),
    ],
    ["Задать вопрос❓"],
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithPhoto(
      { source: "./assets/images/author_info.jpg" },
      {
        protect_content: true,
        parse_mode: "HTML",
        caption: messages.authorInfoWithPicMessage.ru,
        reply_markup: { remove_keyboard: true },
      }
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }
  setTimeout(async () => {
    try {
      await ctx.replyWithHTML(
        messages.authorInfoWithoutPicMessage.ru,
        keyboards.getBackToPaymentKeyboard
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }

    setTimeout(async () => {
      if (ctx.session.timeOut6) {
        await ctx.replyWithHTML(
          messages.paymentLinkMessage.ru + paymentLinks[ctx.session.userRate],
          paymentLinkMessageKeyboard
        );
      }
    }, TenMinTimer);
  }, 5000);
});

bot.action("authorInfoNoPicMessage-getPaymentLinkMessage", async (ctx) => {
  const userId = ctx.from.id;
  ctx.session.timeOut6 = false;
  const paymentLinkMessageKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check-primary-payment?userId=${userId}`
      ),
    ],
    ["Задать вопрос❓"],
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithHTML(
      messages.paymentLinkMessage.ru + paymentLinks[ctx.session.userRate],
      paymentLinkMessageKeyboard
    );
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }
});

bot.hears("Не в этом дело🙃", async (ctx) => {
  const userId = ctx.from.id;

  try {
    await ctx.replyWithHTML(messages.noPaymentFinalMessage.ru);
  } catch (error) {
    console.error(error);
  }
});

bot.action("getFormulaMessage-chatLink", async (ctx) => {
  const userId = ctx.from.id;

  try {
    await ctx.replyWithHTML("https://t.me/+vRPrDecgJ5k1MmFi", {
      protect_content: true,
    });
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage.ru);
  }

  const signUpForSessionIntroKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Записаться на сессию✍️",
        `${webAppUrl}/session-register`
      ),
    ],
  ])
    .resize()
    .oneTime();

  if (ctx.session.userRate === "pro") {
    try {
      await ctx.replyWithHTML(
        messages.signUpForSessionIntroMessage.ru,
        signUpForSessionIntroKeyboard
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }
  } else if (ctx.session.userRate === "advanced") {
    const advancedUpgradeOfferKeyboard = Markup.keyboard([
      ["Оплатить картой 21$💳"],
      ["Оплатить криптой 21$💎"]
    ])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithVideo(
        { source: "./assets/special_offers/special_advanced.mp4" },
        {
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.advancedUpgradeOfferMessage.ru,
          ...advancedUpgradeOfferKeyboard,
        }
      );
      setTimeout(async () => {
        if (ctx.session.timeOut7) {
          await ctx.replyWithHTML(
            messages.advancedUpgradeNoPaymentMessage.ru,
            advancedUpgradeOfferKeyboard
          );
          setTimeout(async () => {
            if (ctx.session.timeOut8) {
              await ctx.replyWithHTML(
                messages.advancedUpgradeNoPaymentFinalMessage.ru,
                {
                  reply_markup: { remove_keyboard: true },
                }
              );
            }
          }, deleteUpgradeTimeout);
        }
      }, upgradeTimeout);
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }
  } else if (ctx.session.userRate === "basic") {
    try {
      await ctx.replyWithVideo(
        { source: "./assets/special_offers/special_basic.mp4" },
        {
          protect_content: true,
          parse_mode: "HTML",
          caption: messages.basicUpgradeOfferMessage.ru,
          ...keyboards.basicUpgradeChooseRateKeyboard,
        }
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }
  }
});


bot.hears("Оплатить криптой 21$💎", async (ctx) => {
  const userId = ctx.from.id

  const currencyKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('USDT', 'usdtap')],
    [Markup.button.callback('TON', 'tonap')],
    [Markup.button.callback('BTC', 'btcap')],
    [Markup.button.callback('ETH', 'ethap')],
]);
try {
  await ctx.replyWithHTML(`Выберите удобную валюту:`, currencyKeyboard)
} catch (error) {
  console.error("Error:", error.message);
}
})


const advProCurrenciesArray = ['usdtap', 'tonap', 'btcap', 'ethap']
bot.action(advProCurrenciesArray, async (ctx) => {
  const userRate = ctx.session.userRate

  let convertedPrice = ''

  const userId = ctx.from.id
  const chosenCurrency = ctx.callbackQuery.data
  const exchangeObjArray = await cryptoPay.getExchangeRates()
  exchangeObjArray.forEach(currencyObj => {
    if (chosenCurrency === 'usdtap') {
      if (currencyObj.source === 'USDT' && currencyObj.target === 'USD') {
        convertedPrice = String((21 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'tonap') {
      if (currencyObj.source === 'TON' && currencyObj.target === 'USD') {
        convertedPrice = String((21 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'btcap') {
      if (currencyObj.source === 'BTC' && currencyObj.target === 'USD') {
        convertedPrice = String((21 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'ethap') {
      if (currencyObj.source === 'ETH' && currencyObj.target === 'USD') {
        convertedPrice = String((21 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    }
  })

  const asset = {
    'usdtap': Assets.USDT,
    'tonap': Assets.TON,
    'btcap': Assets.BTC,
    'ethap': Assets.ETH
  }

  const invoice = await cryptoPay.createInvoice(asset[chosenCurrency], convertedPrice, {
    description: `Апгрейд AVANCED-PRO`,
    paid_btn_name: PaidButtonNames.OPEN_BOT,
    paid_btn_url: 'https://t.me/proIevel_bot',
    payload: userId,
  });

  ctx.session.advProInvoiceId = invoice.invoice_id
  console.log(`Invoice id ${invoice.invoice_id}`);

  const cryptoPaymentKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Оплатить', `${invoice.pay_url}`)],
    [Markup.button.callback('Проверить оплату', `checkAdvProCryptoPayment`)]
]);

 
  await ctx.replyWithPhoto({source: './assets/images/crypto.jpg'}, {
    parse_mode: 'HTML',
    protect_content: true,
    caption: `Детали заказа:\n\nТовар: <b>Апгрейд ADVANCED-PRO</b>\n\nСтоимость: <b>${convertedPrice}</b>\n\nПосле оплаты нажмите кнопку "Проверить оплату"`,
    ...cryptoPaymentKeyboard
  })
})


bot.action("checkAdvProCryptoPayment", async (ctx) => {
  const userId = ctx.from.id

  const invoiceStatus = await cryptoPay.getInvoices({invoice_ids: String(ctx.session.advProInvoiceId)});
    const status = invoiceStatus.items[0].status
    
    if (status === 'paid' || userId === 689818355 || userId === 514751965) {
      try {
        await mainDb.updateUserParameter(userId, "userUpgradedAdvToPro", true)
      } catch (error) {
        
      }
    }

    const signUpForSessionIntroKeyboard = Markup.keyboard([
      [
        Markup.button.webApp(
          "Записаться на сессию✍️",
          `${webAppUrl}/session-register`
        ),
      ],
    ])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithHTML(
        messages.advancedUpgradeSuccessPaymentMessage.ru,
        signUpForSessionIntroKeyboard
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }
})


bot.hears("Оплатить картой 21$💳", async (ctx) => {

  const advancedToProCheckPaymentKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check-adv-pro-payment`
      ),
    ],
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithPhoto({source: './assets/images/card.jpg'}, {
      protect_content: true,
      parse_mode: 'HTML',
      caption: `Вот твоя ссылка для оплаты\n\nhttps://mel.store/azhypa/27004`,
      ...advancedToProCheckPaymentKeyboard
    })
  } catch (error) {
    
  }
})

bot.action(
  "basicUpgradeOfferMessage-basicUpgradeToAdvancedPaymentMessage",
  async (ctx) => {
    const userId = ctx.from.id;

    const basicToAdvancedUpgradeOfferKeyboard = Markup.keyboard([
      ["Оплатить картой 29$💳"],
      ["Оплатить криптой 29$💎"]
    ])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithHTML(
        "Выбери способ оплаты ниже",
        basicToAdvancedUpgradeOfferKeyboard
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }
  }
);

bot.action(
  "basicUpgradeOfferMessage-basicUpgradeToProPaymentMessage",
  async (ctx) => {
    const userId = ctx.from.id;

    const basicToProUpgradeOfferKeyboard = Markup.keyboard([
      ["Оплатить картой 50$💳"],
      ["Оплатить криптой 50$💎"]
    ])
      .resize()
      .oneTime();

    try {
      await ctx.replyWithHTML(
        "Выбери способ оплаты ниже",
        basicToProUpgradeOfferKeyboard
      );
    } catch (error) {
      console.error(error);
      await ctx.replyWithHTML(messages.techProblemsMessage.ru);
    }
  }
);


bot.hears("Оплатить картой 29$💳", async (ctx) => {
  const userId = ctx.from.id

  const basicToAdvCheckPaymentKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check-bas-adv-payment`
      ),
    ],
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithPhoto({source: './assets/images/card.jpg'}, {
      protect_content: true,
      parse_mode: 'HTML',
      caption: `Твоя ссылка для оплаты\n\nhttps://mel.store/azhypa/27008`,
      ...basicToAdvCheckPaymentKeyboard
    })
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage)
  }
})

bot.hears("Оплатить картой 50$💳", async (ctx) => {
  const userId = ctx.from.id

  const basicToProCheckPaymentKeyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check-bas-pro-payment`
      ),
    ],
  ])
    .resize()
    .oneTime();

  try {
    await ctx.replyWithPhoto({source: './assets/images/card.jpg'}, {
      protect_content: true,
      parse_mode: 'HTML',
      caption: `Твоя ссылка для оплаты\n\nhttps://mel.store/azhypa/27010`,
      ...basicToProCheckPaymentKeyboard
    })
  } catch (error) {
    console.error(error);
    await ctx.replyWithHTML(messages.techProblemsMessage)
  }
})


bot.hears("Оплатить криптой 50$💎", async (ctx) => {
  const userId = ctx.from.id

  console.log("works");
  const currencyKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('USDT', 'usdtbp')],
    [Markup.button.callback('TON', 'tonbp')],
    [Markup.button.callback('BTC', 'btcbp')],
    [Markup.button.callback('ETH', 'ethbp')],
]);
try {
  await ctx.replyWithHTML(`Выберите удобную валюту:`, currencyKeyboard)
} catch (error) {
  console.error("Error:", error.message);
}
})

const basProCurrenciesArray = ['usdtbp', 'tonbp', 'btcbp', 'ethbp']
bot.action(basProCurrenciesArray, async (ctx) => {

  let convertedPrice = ''

  const userId = ctx.from.id
  const chosenCurrency = ctx.callbackQuery.data
  const exchangeObjArray = await cryptoPay.getExchangeRates()
  exchangeObjArray.forEach(currencyObj => {
    if (chosenCurrency === 'usdtbp') {
      if (currencyObj.source === 'USDT' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'tonbp') {
      if (currencyObj.source === 'TON' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'btcbp') {
      if (currencyObj.source === 'BTC' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'ethbp') {
      if (currencyObj.source === 'ETH' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    }
  })

  const asset = {
    'usdtbp': Assets.USDT,
    'tonbp': Assets.TON,
    'btcbp': Assets.BTC,
    'ethbp': Assets.ETH
  }

  const invoice = await cryptoPay.createInvoice(asset[chosenCurrency], convertedPrice, {
    description: `Апгрейд BASIC-PRO`,
    paid_btn_name: PaidButtonNames.OPEN_BOT,
    paid_btn_url: 'https://t.me/proIevel_bot',
    payload: userId,
  });

  ctx.session.basProInvoiceId = invoice.invoice_id
  console.log(`Invoice id ${invoice.invoice_id}`);

  const cryptoPaymentKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Оплатить', `${invoice.pay_url}`)],
    [Markup.button.callback('Проверить оплату', `checkBasProCryptoPayment`)]
]);

 
  await ctx.replyWithPhoto({source: './assets/images/crypto.jpg'}, {
    parse_mode: 'HTML',
    protect_content: true,
    caption: `Детали заказа:\n\nТовар: <b>Апгрейд BASIC-PRO</b>\n\nСтоимость: <b>${convertedPrice}</b>\n\nПосле оплаты нажмите кнопку "Проверить оплату"`,
    ...cryptoPaymentKeyboard
  })
})

bot.hears("Оплатить криптой 29$💎", async (ctx) => {
  const userId = ctx.from.id

  console.log("works");
  const currencyKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('USDT', 'usdtba')],
    [Markup.button.callback('TON', 'tonba')],
    [Markup.button.callback('BTC', 'btcba')],
    [Markup.button.callback('ETH', 'ethba')],
]);
try {
  await ctx.replyWithHTML(`Выберите удобную валюту:`, currencyKeyboard)
} catch (error) {
  console.error("Error:", error.message);
}
})

const basAdvCurrenciesArray = ['usdtba', 'tonba', 'btcba', 'ethba']
bot.action(basAdvCurrenciesArray, async (ctx) => {

  let convertedPrice = ''

  const userId = ctx.from.id
  const chosenCurrency = ctx.callbackQuery.data
  const exchangeObjArray = await cryptoPay.getExchangeRates()
  exchangeObjArray.forEach(currencyObj => {
    if (chosenCurrency === 'usdtba') {
      if (currencyObj.source === 'USDT' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'tonba') {
      if (currencyObj.source === 'TON' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'btcba') {
      if (currencyObj.source === 'BTC' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    } else if (chosenCurrency === 'ethba') {
      if (currencyObj.source === 'ETH' && currencyObj.target === 'USD') {
        convertedPrice = String((50 / currencyObj.rate).toFixed(5))
        console.log(convertedPrice);
      }
    }
  })

  const asset = {
    'usdtba': Assets.USDT,
    'tonba': Assets.TON,
    'btcba': Assets.BTC,
    'ethba': Assets.ETH
  }

  const invoice = await cryptoPay.createInvoice(asset[chosenCurrency], convertedPrice, {
    description: `Апгрейд BASIC-ADVANCED`,
    paid_btn_name: PaidButtonNames.OPEN_BOT,
    paid_btn_url: 'https://t.me/proIevel_bot',
    payload: userId,
  });

  ctx.session.basAdvInvoiceId = invoice.invoice_id
  console.log(`Invoice id ${invoice.invoice_id}`);

  const cryptoPaymentKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Оплатить', `${invoice.pay_url}`)],
    [Markup.button.callback('Проверить оплату', `checkBasAdvCryptoPayment`)]
]);

 
  await ctx.replyWithPhoto({source: './assets/images/crypto.jpg'}, {
    parse_mode: 'HTML',
    protect_content: true,
    caption: `Детали заказа:\n\nТовар: <b>Апгрейд BASIC-ADVANCED</b>\n\nСтоимость: <b>${convertedPrice}</b>\n\nПосле оплаты нажмите кнопку "Проверить оплату"`,
    ...cryptoPaymentKeyboard
  })
})


bot.action("checkBasProCryptoPayment", async (ctx) => {
  const userId = ctx.from.id

  const invoiceStatus = await cryptoPay.getInvoices({invoice_ids: String(ctx.session.basProInvoiceId)});
    const status = invoiceStatus.items[0].status
    
    if (status === 'paid' || userId === 689818355 || userId === 514751965) {
      try {
        await mainDb.updateUserParameter(userId, "userUpgradedBasToPro", true)
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru)
      }

      const fourthLessonBasicIntroKeyboard = Markup.inlineKeyboard([
        [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/iougBIBi7bhb`)],
      ]);

      try {
        await ctx.replyWithPhoto(
          { source: "./assets/images/lesson4.jpg" },
          {
            protect_content: true,
            caption: messages.basicUpgradeToProLessonFourIntroMessage.ru,
            ...fourthLessonBasicIntroKeyboard,
          }
        );
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru);
      }

      setTimeout(async () => {
        const watchBonusVideoKeyboard = Markup.inlineKeyboard([
          [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/amfjxu9HInd`)],
        ]);

        try {
          setTimeout(async () => {
            await ctx.replyWithPhoto(
              { source: "./assets/images/bonus.jpg" },
              {
                protect_content: true,
                caption: messages.bonusLessonMessage.ru,
                ...watchBonusVideoKeyboard,
              }
            );
          }, 30000);
          setTimeout(async () => {
            await ctx.replyWithDocument(
              { source: "./assets/images/formula2.png" },
              {
                protect_content: true,
                disable_notification: true,
              }
            );

            const signUpForSessionIntroKeyboard = Markup.keyboard([
              [
                Markup.button.webApp(
                  "Записаться на сессию✍️",
                  `${webAppUrl}/session-register`
                ),
              ],
            ])
              .resize()
              .oneTime();

            try {
              await ctx.replyWithHTML(
                messages.signUpForSessionIntroMessage.ru,
                signUpForSessionIntroKeyboard
              );
            } catch (error) {
              console.error(error);
              await ctx.replyWithHTML(messages.techProblemsMessage.ru);
            }
          }, 30000);
        } catch (error) {
          console.error(error);
          await ctx.replyWithHTML(messages.techProblemsMessage.ru);
        }
      }, 10000);

    }
})

bot.action("checkBasAdvCryptoPayment", async (ctx) => {
  const userId = ctx.from.id

  const invoiceStatus = await cryptoPay.getInvoices({invoice_ids: String(ctx.session.basAdvInvoiceId)});
    const status = invoiceStatus.items[0].status
    
    if (status === 'paid' || userId === 689818355 || userId === 514751965) {
      try {
        await mainDb.updateUserParameter(userId, "userUpgradedBasToAdv", true)
      } catch (error) {
        console.error(error);
        await ctx.replyWithHTML(messages.techProblemsMessage.ru)
      }

      const fourthLessonBasicIntroKeyboard = Markup.inlineKeyboard([
        [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/iougBIBi7bhb`)],
      ]);
  
        try {
          await ctx.replyWithPhoto(
            { source: "./assets/images/lesson4.jpg" },
            {
              protect_content: true,
              caption: messages.basicUpgradeToAdvancedLessonFourIntroMessage.ru,
              ...fourthLessonBasicIntroKeyboard,
            }
          );
        } catch (error) {
          console.error(error);
          await ctx.replyWithHTML(messages.techProblemsMessage.ru);
        }
  
        setTimeout(async () => {
          const watchBonusVideoKeyboard = Markup.inlineKeyboard([
            [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/amfjxu9HInd`)],
          ]);
  
          try {
            setTimeout(async () => {
              await ctx.replyWithPhoto(
                { source: "./assets/images/bonus.jpg" },
                {
                  protect_content: true,
                  caption: messages.bonusLessonMessage.ru,
                  ...watchBonusVideoKeyboard,
                }
              );
            }, 30000);
            setTimeout(async () => {
              await ctx.replyWithDocument(
                { source: "./assets/images/formula2.png" },
                {
                  protect_content: true,
                }
              );
  
              try {
                await ctx.replyWithHTML(
                  messages.basicUpgradeToAdvancedFinalMessage.ru
                );
              } catch (error) {
                console.error(error);
                await ctx.replyWithHTML(messages.techProblemsMessage.ru);
              }
            }, 30000);
          } catch (error) {
            console.error(error);
            await ctx.replyWithHTML(messages.techProblemsMessage.ru);
          }
        }, 10000);
      }
    }
)









//! СТАРТ БОТА - пропуск сообщений, присланных пока бот был выключен
const option = { dropPendingUpdates: true };
bot.launch(option);
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

//TODO: сделать haptic feedback
//TODO: поменять дизайн тестов
//TODO: на сервер и netlify
