# Node.js Task-6 (SendGrid)

## Критерії прийому

- Створено репозиторій з домашнім завданням — CLI додаток.
- Посилання на репозиторій надіслане ментору на перевірку.
- Код відповідає технічному завданню проєкту.
- При виконанні коду не виникає необроблених помилок.
- Назва змінних, властивостей і методів записана в нотації СamelCase.
- Використовуються англійські слова, назви функцій та методів містять дієслово.
- У коді немає закоментованих ділянок коду.
- Проєкт коректно працює з актуальною LTS-версією Node.

## Крок 1

Створи гілку `06-sendgrid` з гілки main.

Продовжуємо створення REST API для роботи з колекцією контактів. Додайте верифікацію email користувача після реєстрації за допомогою сервісу [SendGrid](https://sendgrid.com/).

**Як процес верифікації повинен працювати**

1. Після реєстрації, користувач повинен отримати лист на вказану при реєстрації пошту з посиланням для верифікації свого email.
2. Пройшовши посиланням в отриманому листі, в перший раз, користувач повинен отримати [Відповідь зі статусом 200](#verification-success-response), що буде мати на увазі успішну верифікацію email.
3. Пройшовши по посиланню повторно користувач повинен отримати [Помилку зі статусом 404](#verification-user-not-found).

## Крок 2

**Підготовка інтеграції з SendGrid API**

- Зареєструйся на [SendGrid](https://sendgrid.com/).
- Створи email-відправника. Для це в адміністративній панелі SendGrid зайдіть в меню Marketing в підміню senders і в правому верхньому куті натисніть кнопку "Create New Sender". Заповніть поля в запропонованій формі. Збережіть. Повинен вийде наступний як на картинці результат, тільки з вашим email:

На вказаний email повинно прийти лист верифікації (перевірте спам якщо не бачите листи). Натисніть на посилання в ньому і завершите процес. Результат повинен зміниться на:

Тепер необхідно створити API токен доступу. Вибираємо меню "Email API", і підміню "Integration Guide". Тут вибираємо "Web API":

Далі необхідно вибрати технологію Node.js:

На третьому кроці даємо ім'я нашого токені. Наприклад systemcats, натискаємо кнопку згенерувати і отримуємо результат як на скріншоті нижче. Необхідно скопіювати цей токен (це важливо, тому що більше ви не зможете його подивитися). Після завершити процес створення токена:

Отриманий API-токен треба додати в `.env` файл в нашому проекті.

## Крок 3

Створення ендпоінта для верифікації email
Додати в модель `User` два поля `verificationToken` і `verify`. Значення поля `verify` рівне `false` означатиме, що його email ще не пройшов верифікацію.

```
{
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
}
```

- створити ендпоінт GET [`/users/verify/:verificationToken`](#verification-request), де по параметру `verificationToken` ми будемо шукати користувача в моделі `User`.
- якщо користувач з таким токеном не знайдений, необхідно повернути [Помилку 'Not Found'](#verification-user-not-found).
- якщо користувач знайдений - встановлюємо `verificationToken` в `null`, а поле `verify` ставимо рівним `true` в документі користувача і повертаємо [Успішний відповідь](#verification-success-response).

**Verification request**
`GET /auth/verify/:verificationToken`

**Verification user Not Found**

```
Status: 404 Not Found
ResponseBody: {
  message: 'User not found'
}
```

**Verification success response**

```
Status: 200 OK
ResponseBody: {
  message: 'Verification successful',
}
```

## Крок 4

**Додавання відправки email користувачу з посиланням для верифікації**

При створення користувача при реєстрації:

- створити `verificationToken` для користувача і записати його в БД (для генерації токена використовуйте пакет [uuid](https://www.npmjs.com/package/uuid) або [nanoid](https://www.npmjs.com/package/nanoid));
- відправити email на пошту користувача і вказати посилання для верифікації email'а (`/users/verify/:verificationToken`) в повідомленні;
- Так само необхідно враховувати, що тепер логін користувача не дозволено, якщо не верифікувано email.

## Крок 5

**Додавання повторної відправки email користувачу з посиланням для верифікації**

Необхідно передбачити, варіант, що користувач може випадково видалити лист. Воно може не дійти з якоїсь причини до адресата. Наш сервіс відправки листів під час реєстрації видав помилку і т.д.

**@ POST /users/verify**

- Отримує `body` в форматі `{email}`
- Якщо в `body` немає обов'язкового поля `email`, повертає json з ключем `{"message":"Email not found"}` і статусом `404`.
- Якщо з `body` все добре, виконуємо повторну відправку листа з `verificationToken` на вказаний `email`, але тільки якщо користувач не верифікований.
- Якщо користувач вже пройшов верифікацію відправити json з ключем `{"message":"Email already verify"}` зі статусом `400`.

**Resending a email request**

```
POST /users/verify
Content-Type: application/json
RequestBody: {
  "email": "example@example.com"
}
```

**Resending a email validation error**

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Помилка від Joi або іншої бібліотеки валідації>
```

**Resending a email success response**

```
Status: 200 Ok
Content-Type: application/json
ResponseBody: {
  "message": "Verify email send success"
}
```

**Resend email for verified user**

```
Status: 401 Bad Request
Content-Type: application/json
ResponseBody: {
  message: "Email already verify"
}
```
