import amqplib from 'amqplib';

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'tasks_queue';
const MAX_RETRIES = 3;   // минимум 3 попытки (как в задании)

// Функция-имитация обработки задачи (может падать)
async function processTask(task) {
  console.log(`[Worker] Обработка задачи: ${JSON.stringify(task)}`);

  // Имитация случайной ошибки (например, email-сервис недоступен)
  const failProbability = 0.6; // 60% ошибок для демонстрации ретраев
  if (Math.random() < failProbability) {
    throw new Error('Временный сбой при обработке');
  }

  // Имитация долгой работы (отправка email, генерация PDF и т.д.)
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log(`[Worker] Задача выполнена: ${task.type}`);
}

async function startWorker(workerId = 1) {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'dlx_exchange',
      'x-dead-letter-routing-key': 'dead',
      'x-message-ttl': 60000,
    },
  });
  // Не больше 1 задачи за раз на воркера
  channel.prefetch(1);

  console.log(`[Worker ${workerId}] Ожидание задач...`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const task = JSON.parse(msg.content.toString());
    // Получаем текущий счётчик попыток из заголовков (если нет – 0)
    let retryCount = msg.properties.headers?.['x-retry-count'] || 0;

    console.log(`[Worker ${workerId}] Попытка ${retryCount + 1}/${MAX_RETRIES} для задачи ${task.type}`);

    try {
      await processTask(task);
      // Успех – подтверждаем и удаляем из очереди
      channel.ack(msg);
      console.log(`[Worker ${workerId}] Задача завершена успешно`);
    } catch (err) {
      console.error(`[Worker ${workerId}] Ошибка: ${err.message}`);

      if (retryCount + 1 < MAX_RETRIES) {
        // Повтор: увеличиваем счётчик, задержка экспоненциально
        const newRetryCount = retryCount + 1;
        const delay = 1000 * Math.pow(2, retryCount); // 1с, 2с, 4с
        console.log(`[Worker ${workerId}] Повтор через ${delay} мс (попытка ${newRetryCount + 1}/${MAX_RETRIES})`);

        // Задержка перед повторной отправкой
        await new Promise(resolve => setTimeout(resolve, delay));

        // Публикуем сообщение заново с обновлённым счётчиком
        channel.sendToQueue(QUEUE_NAME, msg.content, {
          persistent: true,
          headers: { 'x-retry-count': newRetryCount },
        });
        // Удаляем старое сообщение (отклоняем без возврата в очередь)
        channel.ack(msg);
      } else {
        // Исчерпаны все попытки – сообщение уйдёт в DLQ автоматически,
        // т.к. мы его отклоняем (nack) без повторного помещения в очередь.
        console.error(`[Worker ${workerId}] Исчерпаны попытки. Сообщение отправляется в DLQ.`);
        channel.nack(msg, false, false); // false = не возвращать в очередь
      }
    }
  });
}

// Запускаем воркер с ID (можно передать через переменную окружения)
const WORKER_ID = process.env.WORKER_ID || '1';
startWorker(WORKER_ID).catch(console.error);