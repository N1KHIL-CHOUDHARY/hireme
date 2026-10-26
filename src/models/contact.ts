import { getSupabaseAdmin } from '@/lib/supabase';

export interface IContact {
  id: string;
  _id: string;
  name: string;
  email: string;
  message: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  toJSON?: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function formatContact(row: any): IContact { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!row) return row;
  const id = String(row.id || row._id);
  const contact: IContact = {
    id,
    _id: id,
    name: row.name,
    email: row.email,
    message: row.message,
    isResolved: row.isResolved !== false && !!row.isResolved,
    createdAt: new Date(row.createdAt || row.created_at || Date.now()),
    updatedAt: new Date(row.updatedAt || row.updated_at || Date.now()),
    toJSON: function () {
      const copy = { ...this };
      delete copy.toJSON;
      return copy;
    },
  };
  return contact;
}

class ContactQuery<T = IContact | IContact[] | null> implements PromiseLike<T> {
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
    let query = supabase.from('contacts').select('*');

    if (this.filter) {
      if (this.filter._id) query = query.eq('id', this.filter._id);
      if (this.filter.id) query = query.eq('id', this.filter.id);
      if (typeof this.filter.isResolved === 'boolean') {
        query = query.eq('isResolved', this.filter.isResolved);
      }
      if (Array.isArray(this.filter.$or) && this.filter.$or.length > 0) {
        const orClauses: string[] = [];
        for (const item of this.filter.$or) {
          if (item.name?.$regex) orClauses.push(`name.ilike.%${item.name.$regex}%`);
          if (item.email?.$regex) orClauses.push(`email.ilike.%${item.email.$regex}%`);
          if (item.message?.$regex) orClauses.push(`message.ilike.%${item.message.$regex}%`);
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
      return formatContact(data) as unknown as T;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching contacts from Supabase:', error);
      return [] as unknown as T;
    }

    const formatted = (data || []).map((row) => formatContact(row));
    return formatted as unknown as T;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export const Contact = {
  find(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new ContactQuery<IContact[]>(filter, false);
  },

  findById(id: string) {
    return new ContactQuery<IContact | null>({ id }, true);
  },

  async create(data: { name: string; email: string; message: string }): Promise<IContact> {
    const supabase = getSupabaseAdmin();
    const insertData = {
      name: data.name,
      email: data.email,
      message: data.message,
      isResolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('contacts')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating contact in Supabase:', error);
      throw new Error(`Failed to create contact: ${error.message}`);
    }

    return formatContact(created);
  },

  async findByIdAndUpdate(
    id: string,
    update: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options: { new?: boolean } = { new: true } // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<IContact | null> {
    const supabase = getSupabaseAdmin();
    const cleanUpdate = update.$set ? { ...update.$set } : { ...update };
    cleanUpdate.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('contacts')
      .update(cleanUpdate)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error updating contact in Supabase:', error);
      throw new Error(`Failed to update contact: ${error.message}`);
    }

    return data ? formatContact(data) : null;
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting contact in Supabase:', error);
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
    return true;
  },

  async countDocuments(filter: any = {}): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();
    let query = supabase.from('contacts').select('*', { count: 'exact', head: true });

    if (Array.isArray(filter.$or) && filter.$or.length > 0) {
      const orClauses: string[] = [];
      for (const item of filter.$or) {
        if (item.name?.$regex) orClauses.push(`name.ilike.%${item.name.$regex}%`);
        if (item.email?.$regex) orClauses.push(`email.ilike.%${item.email.$regex}%`);
        if (item.message?.$regex) orClauses.push(`message.ilike.%${item.message.$regex}%`);
      }
      if (orClauses.length > 0) query = query.or(orClauses.join(','));
    }

    const { count, error } = await query;
    if (error) {
      console.error('Error counting contacts in Supabase:', error);
      return 0;
    }
    return count || 0;
  },
};

export default Contact;
