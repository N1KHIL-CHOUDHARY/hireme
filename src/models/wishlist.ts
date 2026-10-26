import { getSupabaseAdmin } from '@/lib/supabase';

export interface IWishlist {
  id: string;
  _id: string;
  name: string;
  email: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
  toJSON?: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function formatWishlist(row: any): IWishlist { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!row) return row;
  const id = String(row.id || row._id);
  const entry: IWishlist = {
    id,
    _id: id,
    name: row.name,
    email: row.email,
    reason: row.reason || undefined,
    createdAt: new Date(row.createdAt || row.created_at || Date.now()),
    updatedAt: new Date(row.updatedAt || row.updated_at || Date.now()),
    toJSON: function () {
      const copy = { ...this };
      delete copy.toJSON;
      return copy;
    },
  };
  return entry;
}

class WishlistQuery<T = IWishlist | IWishlist[] | null> implements PromiseLike<T> {
  private filter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private isSingle: boolean;
  private _limit?: number;
  private _skip?: number;
  private _sort?: Record<string, number>;

  constructor(filter: any = {}, isSingle = false) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.filter = filter;
    this.isSingle = isSingle;
  }

  sort(sortObj: Record<string, number>) {
    this._sort = sortObj;
    return this;
  }

  skip(count: number) {
    this._skip = count;
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<T> {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('wishlists').select('*');

    if (this.filter) {
      if (this.filter.email) {
        query = query.eq('email', this.filter.email.toLowerCase());
      }
      if (Array.isArray(this.filter.$or) && this.filter.$or.length > 0) {
        const orClauses: string[] = [];
        for (const item of this.filter.$or) {
          if (item.name?.$regex) orClauses.push(`name.ilike.%${item.name.$regex}%`);
          if (item.email?.$regex) orClauses.push(`email.ilike.%${item.email.$regex}%`);
          if (item.reason?.$regex) orClauses.push(`reason.ilike.%${item.reason.$regex}%`);
        }
        if (orClauses.length > 0) query = query.or(orClauses.join(','));
      }
    }

    if (this._sort) {
      for (const [key, dir] of Object.entries(this._sort)) {
        query = query.order(key, { ascending: dir === 1 });
      }
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    if (this._skip !== undefined && this._limit !== undefined) {
      query = query.range(this._skip, this._skip + this._limit - 1);
    } else if (this._limit !== undefined) {
      query = query.limit(this._limit);
    }

    if (this.isSingle) {
      const { data, error } = await query.limit(1).maybeSingle();
      if (error || !data) return null as unknown as T;
      return formatWishlist(data) as unknown as T;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching wishlists from Supabase:', error);
      return [] as unknown as T;
    }

    const formatted = (data || []).map((row) => formatWishlist(row));
    return formatted as unknown as T;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export const Wishlist = {
  findOne(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new WishlistQuery<IWishlist | null>(filter, true);
  },

  find(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new WishlistQuery<IWishlist[]>(filter, false);
  },

  async create(data: { name: string; email: string; reason?: string }): Promise<IWishlist> {
    const supabase = getSupabaseAdmin();
    const insertData = {
      name: data.name,
      email: data.email.toLowerCase(),
      reason: data.reason || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('wishlists')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating wishlist in Supabase:', error);
      throw new Error(`Failed to create wishlist entry: ${error.message}`);
    }

    return formatWishlist(created);
  },

  async countDocuments(filter: any = {}): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();
    let query = supabase.from('wishlists').select('*', { count: 'exact', head: true });

    if (Array.isArray(filter.$or) && filter.$or.length > 0) {
      const orClauses: string[] = [];
      for (const item of filter.$or) {
        if (item.name?.$regex) orClauses.push(`name.ilike.%${item.name.$regex}%`);
        if (item.email?.$regex) orClauses.push(`email.ilike.%${item.email.$regex}%`);
        if (item.reason?.$regex) orClauses.push(`reason.ilike.%${item.reason.$regex}%`);
      }
      if (orClauses.length > 0) query = query.or(orClauses.join(','));
    }

    const { count, error } = await query;
    if (error) {
      console.error('Error counting wishlists in Supabase:', error);
      return 0;
    }
    return count || 0;
  },
};

export default Wishlist;
