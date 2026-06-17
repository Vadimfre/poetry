import { toast } from "sonner";
import { getCookie } from "@/src/shared/i18n/cookie";
import { LOCALE_COOKIE } from "@/src/shared/i18n/types";
import { be } from "@/src/shared/i18n/locales/be";
import { ru } from "@/src/shared/i18n/locales/ru";
import type { Locale } from "@/src/shared/i18n/types";

const messages: Record<Locale, { errorServer: string }> = {
  be: { errorServer: be.common.errorServer },
  ru: { errorServer: ru.common.errorServer },
};

function getDefaultErrorMessage(): string {
  if (typeof window === "undefined") return messages.be.errorServer;
  const locale = (getCookie(LOCALE_COOKIE) ?? "be") as Locale;
  return messages[locale]?.errorServer ?? messages.be.errorServer;
}

export function toastMessageHandler(error: unknown) {
  let message = getDefaultErrorMessage();
  let description: string | undefined;

  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  if (err.response?.data?.message) {
    message = err.response.data.message;
  } else if (err.message) {
    message = err.message;
  }

  const firstDotIndex = message.indexOf(".");

  if (firstDotIndex !== -1) {
    const title = message.slice(0, firstDotIndex).trim();
    description = message.slice(firstDotIndex + 1).trim();

    if (description && description.length > 0) {
      toast.error(title, { description });
    } else {
      toast.error(title);
    }
  } else {
    toast.error(message);
  }
}
