import { toast } from "sonner";

export function toastMessageHandler(error: any) {
  // Определяем сообщение об ошибке
  let message = "Ошибка со стороны сервера";
  let description: string | undefined;

  // Пытаемся извлечь сообщение из различных мест ошибки
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  // Обрабатываем сообщение: разделяем на заголовок и описание по точке
  const firstDotIndex = message.indexOf(".");

  if (firstDotIndex !== -1) {
    const title = message.slice(0, firstDotIndex).trim();
    description = message.slice(firstDotIndex + 1).trim();

    // Если описание пустое после точки, не показываем его
    if (description && description.length > 0) {
      toast.error(title, { description });
    } else {
      toast.error(title);
    }
  } else {
    toast.error(message);
  }
}
