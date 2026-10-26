import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';

export type UserRole = 'admin' | 'recruiter' | 'candidate';

export interface IUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?: (password: string) => Promise<boolean>;
  toJSON(): Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function formatUser(row: any): IUser { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!row) return row;
  const id = String(row.id || row._id);
  const user: IUser = {
    id,
    _id: id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: (row.role || 'candidate') as UserRole,
    isActive: row.isActive !== false,
    createdAt: new Date(row.createdAt || row.created_at || Date.now()),
    updatedAt: new Date(row.updatedAt || row.updated_at || Date.now()),
    comparePassword: async function (candidatePassword: string): Promise<boolean> {
      if (!this.password) return false;
      return bcrypt.compare(candidatePassword, this.password);
    },
    toJSON: function () {
      const copy: any = { ...this }; // eslint-disable-line @typescript-eslint/no-explicit-any
      delete copy.comparePassword;
      delete copy.toJSON;
      return copy;
    },
  };
  return user;
}

class UserQuery<T = IUser | IUser[] | null> implements PromiseLike<T> {
  private filter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private isSingle: boolean;
  private includePassword = false;
  private _limit?: number;
  private _skip?: number;
  private _sort?: Record<string, number>;
  private updateData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(filter: any = {}, isSingle = false, updateData?: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.filter = filter;
    this.isSingle = isSingle;
    this.updateData = updateData;
  }

  select(fields: string) {
    if (fields.includes('+password')) {
      this.includePassword = true;
    } else if (fields.includes('-password')) {
      this.includePassword = false;
    }
    return this;
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

    // If this is an update query
    if (this.updateData && this.filter?.id) {
      const cleanUpdate = this.updateData.$set ? { ...this.updateData.$set } : { ...this.updateData };

      if (cleanUpdate.password) {
        const salt = await bcrypt.genSalt(10);
        cleanUpdate.password = await bcrypt.hash(cleanUpdate.password, salt);
      }
      cleanUpdate.updatedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(cleanUpdate)
        .eq('id', this.filter.id)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      if (!data) return null as unknown as T;
      const formatted = formatUser(data);
      if (!this.includePassword) delete formatted.password;
      return formatted as unknown as T;
    }

    let query = supabase.from('users').select('*');

    if (this.filter) {
      if (this.filter._id) query = query.eq('id', this.filter._id);
      if (this.filter.id) query = query.eq('id', this.filter.id);
      if (this.filter.email && typeof this.filter.email === 'string') {
        query = query.eq('email', this.filter.email.toLowerCase());
      }
      if (this.filter.role) query = query.eq('role', this.filter.role);
      if (typeof this.filter.isActive === 'boolean') {
        query = query.eq('isActive', this.filter.isActive);
      }
      if (Array.isArray(this.filter.$or) && this.filter.$or.length > 0) {
        const orClauses: string[] = [];
        for (const item of this.filter.$or) {
          if (item.name?.$regex) orClauses.push(`name.ilike.%${item.name.$regex}%`);
          if (item.email?.$regex) orClauses.push(`email.ilike.%${item.email.$regex}%`);
        }
        if (orClauses.length > 0) query = query.or(orClauses.join(','));
      }
    }

    if (this._sort) {
      for (const [key, dir] of Object.entries(this._sort)) {
        query = query.order(key === 'createdAt' ? 'createdAt' : key, { ascending: dir === 1 });
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
      if (error) {
        console.error('Error fetching user from Supabase:', error);
        return null as unknown as T;
      }
      if (!data) return null as unknown as T;
      const formatted = formatUser(data);
      if (!this.includePassword) delete formatted.password;
      return formatted as unknown as T;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return [] as unknown as T;
    }

    const formatted = (data || []).map((row) => {
      const u = formatUser(row);
      if (!this.includePassword) delete u.password;
      return u;
    });

    return formatted as unknown as T;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<T | TResult> {
    return this.exec().catch(onrejected);
  }
}

export const User = {
  findOne(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new UserQuery<IUser | null>(filter, true);
  },

  findById(id: string) {
    return new UserQuery<IUser | null>({ id }, true);
  },

  find(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new UserQuery<IUser[]>(filter, false);
  },

  async create(data: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<IUser> {
    const supabase = getSupabaseAdmin();

    let hashedPassword = data.password || '';
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(data.password, salt);
    }

    const insertData = {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'candidate',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('users')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return formatUser(created);
  },

  findByIdAndUpdate(
    id: string,
    update: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options: { new?: boolean } = { new: true } // eslint-disable-line @typescript-eslint/no-unused-vars
  ): UserQuery<IUser | null> {
    return new UserQuery<IUser | null>({ id }, true, update);
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Error deleting user in Supabase:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
    return true;
  },

  async countDocuments(filter: any = {}): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();
    let query = supabase.from('users').select('*', { count: 'exact', head: true });

    if (filter.role) query = query.eq('role', filter.role);
    if (typeof filter.isActive === 'boolean') query = query.eq('isActive', filter.isActive);
    if (Array.isArray(filter.$or) && filter.$or.length > 0) {
      const orClauses: string[] = [];
      for (const item of filter.$or) {
        if (item.name?.$regex) orClauses.push(`name.ilike.%${item.name.$regex}%`);
        if (item.email?.$regex) orClauses.push(`email.ilike.%${item.email.$regex}%`);
      }
      if (orClauses.length > 0) query = query.or(orClauses.join(','));
    }

    const { count, error } = await query;
    if (error) {
      console.error('Error counting users in Supabase:', error);
      return 0;
    }
    return count || 0;
  },

  async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hash);
  },
};

export default User;
