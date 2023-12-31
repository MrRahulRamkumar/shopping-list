"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { List } from "@/app/_components/list";
import { useSession } from "next-auth/react";
import { Loading } from "@/app/_components/loading";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { useContext, useEffect, useState } from "react";
import { ListPageContext } from "@/lib/list-page-context";
import { type SelectShoppingListItemWithRelations } from "@/server/db/schema";
import {
  NEW_ITEM_CHANNEL,
  COMPLETE_ITEM_CHANNEL,
  DELETE_ITEM_CHANEL,
  JOIN_ROOM_CHANNEL,
} from "@/lib/constants";

export default function Page({ params }: { params: { slug: string } }) {
  const utils = api.useUtils();
  const slug = params.slug;
  const session = useSession();
  const context = useContext(ListPageContext);
  const [socketConnecting, setSocketConnecting] = useState(true);

  useEffect(() => {
    if (!context?.socket) {
      return;
    }

    context.socket.on("connect", () => {
      console.log("connected to socket", context?.socket?.id);

      // Request to join a room
      context?.socket?.emit(JOIN_ROOM_CHANNEL, slug);
      setSocketConnecting(false);
    });

    context.socket.on(
      NEW_ITEM_CHANNEL,
      (payload: {
        shoppingListItemSlug: string;
        shoppingListItems: SelectShoppingListItemWithRelations[];
      }) => {
        utils.shoppingList.getShoppingList.setData(slug, (prevShoppingList) => {
          if (!prevShoppingList) {
            return prevShoppingList;
          }

          const items = [
            ...payload.shoppingListItems.map((shoppingListItem) => {
              return {
                ...shoppingListItem,
                updatedAt: new Date(shoppingListItem.updatedAt),
                createdAt: new Date(shoppingListItem.createdAt),
              };
            }),
            ...prevShoppingList.items,
          ];

          return {
            ...prevShoppingList,
            items: items,
          };
        });
      },
    );

    context.socket.on(
      COMPLETE_ITEM_CHANNEL,
      (payload: {
        shoppingListItemSlug: string;
        shoppingListItem: SelectShoppingListItemWithRelations;
      }) => {
        utils.shoppingList.getShoppingList.setData(slug, (prevShoppingList) => {
          if (!prevShoppingList) {
            return prevShoppingList;
          }

          const items = prevShoppingList.items
            .map((item) => {
              if (item.id === payload.shoppingListItem.id) {
                return {
                  ...payload.shoppingListItem,
                  createdAt: new Date(payload.shoppingListItem.createdAt),
                  updatedAt: new Date(payload.shoppingListItem.updatedAt),
                  completedAt: payload.shoppingListItem.completedAt
                    ? new Date(payload.shoppingListItem.completedAt)
                    : null,
                };
              }
              return item;
            })
            .sort((a, b) => {
              if (a.completedAt && !b.completedAt) {
                return 1;
              }
              if (b.completedAt && !a.completedAt) {
                return -1;
              }
              if (a.completedAt && b.completedAt) {
                return a.completedAt.getTime() - b.completedAt.getTime();
              }

              return b.createdAt.getTime() - a.createdAt.getTime();
            });

          return {
            ...prevShoppingList,
            items: items,
          };
        });
      },
    );

    context.socket.on(
      DELETE_ITEM_CHANEL,
      (payload: { shoppingListSlug: string; shoppingListItemId: number }) => {
        utils.shoppingList.getShoppingList.setData(slug, (prevShoppingList) => {
          if (!prevShoppingList) {
            return prevShoppingList;
          }

          const items = prevShoppingList.items.filter((item) => {
            return item.id !== payload.shoppingListItemId;
          });

          return {
            ...prevShoppingList,
            items: items,
          };
        });
      },
    );

    return function () {
      if (!context?.socket) {
        return;
      }
      // Remove all event listeners
      context.socket.off("connect");
      context.socket.off(NEW_ITEM_CHANNEL);
      context.socket.off(COMPLETE_ITEM_CHANNEL);
      context.socket.off(DELETE_ITEM_CHANEL);

      // Close the socket connection
      context.socket.disconnect();
    };
  }, [context?.socket]);

  if (session.status === "loading" || socketConnecting) {
    return (
      <div>
        <Link href="/">
          <Button className="mb-2 mt-4" variant="ghost">
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </Link>
        <Separator />
        <Loading />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    redirect(`/signIn?slug=${params.slug}`);
  }

  return (
    <div>
      <Link href="/">
        <Button className="mb-2 mt-4" variant="ghost">
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </Link>
      <Separator />
      <List slug={slug} />
    </div>
  );
}
