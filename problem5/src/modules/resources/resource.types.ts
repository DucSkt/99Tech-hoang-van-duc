export interface Resource {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ListResourcesResult {
  items: Resource[];
  pagination:
    | {
        mode: "page";
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        nextCursor: string | null;
        hasMore: boolean;
      }
    | {
        mode: "cursor";
        limit: number;
        nextCursor: string | null;
        hasMore: boolean;
      };
}
