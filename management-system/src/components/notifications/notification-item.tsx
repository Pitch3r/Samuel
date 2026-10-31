import { Check, ChevronRight } from "lucide-react";
import { ActionForm } from "@/components/ui/form";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActionResult, Notification } from "@/lib/types";

type ItemAction = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * One notification. The main area is a form button: opening it marks the
 * notification as read and follows its link. Unread items also get a small
 * "mark as read" button that stays on the page.
 */
export function NotificationItem({ notification, action }: { notification: Notification; action: ItemAction }) {
  const unread = !notification.read;
  return (
    <li className={cn("relative flex items-stretch transition-colors", unread ? "bg-blue-tint/35" : "bg-white")}>
      {unread && <span className="absolute inset-y-0 left-0 w-[3px] bg-blue" aria-hidden="true" />}
      <ActionForm action={action} className="min-w-0 flex-1">
        <input type="hidden" name="id" value={notification.id} />
        <input type="hidden" name="intent" value="open" />
        <button
          type="submit"
          className="group flex w-full items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-cloud/80 focus-visible:bg-cloud/80 sm:px-5"
        >
          <span
            className={cn(
              "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-[1.05rem]",
              unread ? "bg-blue text-white" : "bg-cloud text-slate ring-1 ring-mist ring-inset",
            )}
          >
            <NotificationIcon notification={notification} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-3">
              <span className={cn("min-w-0 text-sm leading-snug", unread ? "font-bold text-navy" : "font-semibold text-charcoal")}>
                {unread && <span className="sr-only">Unread: </span>}
                {notification.title}
              </span>
              <time
                dateTime={notification.createdAt}
                title={formatDateTime(notification.createdAt)}
                className="tabular shrink-0 pt-px text-xs whitespace-nowrap text-slate"
              >
                {formatRelative(notification.createdAt)}
              </time>
            </span>
            {notification.body && <span className="mt-1 line-clamp-2 block text-sm text-slate">{notification.body}</span>}
            {notification.href && (
              <span className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-semibold text-blue-dark group-hover:underline">
                Open
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </span>
            )}
          </span>
        </button>
      </ActionForm>
      {unread && (
        <ActionForm action={action} className="flex shrink-0 items-start pt-4 pr-3 sm:pr-4">
          <input type="hidden" name="id" value={notification.id} />
          <input type="hidden" name="intent" value="read" />
          <button
            type="submit"
            className="grid size-8 place-items-center rounded-lg text-slate ring-1 ring-mist ring-inset hover:bg-white hover:text-navy"
            title="Mark as read"
          >
            <Check className="size-4" aria-hidden="true" />
            <span className="sr-only">Mark &ldquo;{notification.title}&rdquo; as read</span>
          </button>
        </ActionForm>
      )}
    </li>
  );
}
