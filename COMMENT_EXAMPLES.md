# Примеры использования системы комментариев

## Структура данных

### Комментарий (без ответа)
```json
{
  "id": 1,
  "text": "Отличное стихотворение!",
  "userId": 123,
  "poemId": 456,
  "replyToId": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": 123,
    "name": "Иван Петров",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### Ответ на комментарий
```json
{
  "id": 2,
  "text": "Согласен, очень трогательно",
  "userId": 124,
  "poemId": 456,
  "replyToId": 1,
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  "user": {
    "id": 124,
    "name": "Мария Сидорова",
    "avatar": null
  },
  "replyToComment": {
    "id": 1,
    "text": "Отличное стихотворение!",
    "user": {
      "id": 123,
      "name": "Иван Петров",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

## API Эндпоинты

### 1. Создать комментарий
```http
POST /comments/poem/456
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Отличное стихотворение!"
}
```

### 2. Ответить на комментарий
```http
POST /comments/poem/456
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Согласен, очень трогательно",
  "replyToId": 1
}
```

### 3. Получить все комментарии к стихотворению
```http
GET /comments/poem/456
```

**Ответ:**
```json
[
  {
    "id": 1,
    "text": "Отличное стихотворение!",
    "userId": 123,
    "poemId": 456,
    "replyToId": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": 123,
      "name": "Иван Петров",
      "avatar": "https://example.com/avatar.jpg"
    }
  },
  {
    "id": 2,
    "text": "Согласен, очень трогательно",
    "userId": 124,
    "poemId": 456,
    "replyToId": 1,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "user": {
      "id": 124,
      "name": "Мария Сидорова",
      "avatar": null
    },
    "replyToComment": {
      "id": 1,
      "text": "Отличное стихотворение!",
      "user": {
        "id": 123,
        "name": "Иван Петров",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  }
]
```

### 4. Получить ответы на конкретный комментарий
```http
GET /comments/1/replies
```

**Ответ:**
```json
[
  {
    "id": 2,
    "text": "Согласен, очень трогательно",
    "userId": 124,
    "poemId": 456,
    "replyToId": 1,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "user": {
      "id": 124,
      "name": "Мария Сидорова",
      "avatar": null
    },
    "replyToComment": {
      "id": 1,
      "text": "Отличное стихотворение!",
      "user": {
        "id": 123,
        "name": "Иван Петров",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  }
]
```

## Использование в React

### Получение комментариев
```tsx
import { useComments } from '@/src/features/comments/model/use-comments';

function PoemComments({ poemId }: { poemId: number }) {
  const { data: comments, isLoading } = useComments(poemId);

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div>
      {comments?.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
```

### Создание комментария
```tsx
import { useCreateComment } from '@/src/features/comments/model/use-comments';

function CommentForm({ poemId }: { poemId: number }) {
  const [text, setText] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = async () => {
    await createComment.mutateAsync({
      poemId,
      text,
    });
    setText('');
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Напишите комментарий..."
      />
      <button onClick={handleSubmit}>
        Отправить
      </button>
    </div>
  );
}
```

### Ответ на комментарий
```tsx
import { useCreateComment } from '@/src/features/comments/model/use-comments';

function ReplyButton({ commentId, poemId }: { 
  commentId: number; 
  poemId: number; 
}) {
  const [replyText, setReplyText] = useState('');
  const createComment = useCreateComment();

  const handleReply = async () => {
    await createComment.mutateAsync({
      poemId,
      text: replyText,
      replyToId: commentId,
    });
    setReplyText('');
  };

  return (
    <div>
      <button onClick={() => setReplyText('')}>
        Ответить
      </button>
      {replyText && (
        <div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Напишите ответ..."
          />
          <button onClick={handleReply}>
            Отправить ответ
          </button>
        </div>
      )}
    </div>
  );
}
```

## Логика отображения

Для корректного отображения комментариев с ответами:

1. **Получаем все комментарии** одним запросом `GET /comments/poem/:id`
2. **Фильтруем** основные комментарии (`replyToId === null`)
3. **Отображаем ответы** через `replyToComment` или отдельным запросом

### Пример логики группировки:
```tsx
function groupComments(comments: Comment[]) {
  const mainComments = comments.filter(c => !c.replyToId);
  const replies = comments.filter(c => c.replyToId);
  
  return mainComments.map(comment => ({
    ...comment,
    replies: replies.filter(reply => reply.replyToId === comment.id)
  }));
}
```

## Важные моменты

1. **Плоская структура** - все комментарии хранятся в одной таблице
2. **Контекст ответа** - через `replyToComment` получаем информацию о комментированном сообщении
3. **Нет глубокой вложенности** - все ответы на одном уровне
4. **Масштабируемость** - индексы по `poemId`, `replyToId`, `userId` для быстрых запросов
5. **Каскадное удаление** - при удалении комментария удаляются все его ответы
