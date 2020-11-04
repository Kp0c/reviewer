import { UserNameMapping } from './usernameMapping.model';

export interface Project {
  id?: string;
  name: string;
  description: string,
  host: string;
  owner?: string;
  mappings?: UserNameMapping[];
  users?: string[];
}