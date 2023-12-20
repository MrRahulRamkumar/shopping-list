import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import AddToShoppingList from "@/app/_components/add-to-shopping-list";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

const items = [
  {
    id: "1",
    name: "Milk",
    quantity: 2,
    unit: "liters",
    addedBy: {
      name: "Jane Cooper",
      id: "1",
    },
    checkedBy: {
      name: "Jane Cooper",
      id: "1",
      timestamp: "3d ago",
    },
  },
  {
    id: "2",
    name: "Eggs",
    quantity: 12,
    unit: "units",
    addedBy: {
      name: "Jane Cooper",
      id: "1",
    },
    checkedBy: {
      name: "Jane Cooper",
      id: "1",
      timestamp: "3d ago",
    },
  },
  {
    id: "3",
    name: "Bread",
    quantity: 1,
    unit: "loaf",
    addedBy: {
      name: "Jane Cooper",
      id: "1",
    },
    checkedBy: {
      name: "Jane Cooper",
      id: "1",
      timestamp: "3d ago",
    },
  },
  {
    id: "4",
    name: "Butter",
    quantity: 1,
    unit: "pack",
    addedBy: {
      name: "Jane Cooper",
      id: "1",
    },
    checkedBy: {
      name: "Jane Cooper",
      id: "1",
      timestamp: "3d ago",
    },
  },
  {
    id: "5",
    name: "Cheese",
    quantity: 1,
    unit: "pack",
    addedBy: {
      name: "Jane Cooper",
      id: "1",
    },
    checkedBy: {
      name: "Jane Cooper",
      id: "1",
      timestamp: "3d ago",
    },
  },
];

export default async function List() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/signIn");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden rounded-lg shadow">
        <CardHeader className="flex items-center justify-between px-4 py-5 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-gray-900">
            Collaborative Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {items.map((item) => {
                return <ListItem item={item} />;
              })}
            </ul>
          </div>
          <br />
          <div className="flex items-center justify-center p-4">
            <AddToShoppingList />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ListItemProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    addedBy: {
      name: string;
      id: string;
    };
    checkedBy?: {
      name: string;
      id: string;
      timestamp: string;
    };
  };
}

function ListItem({
  item: { id, name, quantity, unit, addedBy, checkedBy },
}: ListItemProps) {
  return (
    <li key={id} className="py-4">
      <div className="flex items-center space-x-4">
        <Checkbox checked className="text-indigo-600" id="item2" />
        <span className="block">
          <span className="text-sm font-medium text-gray-900">
            {`${name} (${quantity} ${unit})`}
          </span>
          <span className="text-sm text-gray-500">
            <br />
            {"Added by "}
            <Link
              className="font-medium text-indigo-600 hover:text-indigo-500"
              href="#"
            >
              {addedBy.name}
            </Link>
            <br />
            {checkedBy && (
              <div>
                {"Checked by "}
                <Link
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  href="#"
                >
                  {checkedBy.name}
                </Link>
                {` ${checkedBy.timestamp}`}
              </div>
            )}
          </span>
        </span>
      </div>
    </li>
  );
}
