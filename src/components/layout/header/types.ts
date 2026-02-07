export interface NavSubItem {
  name: string;
  url: string;
}

export interface NavItem {
  name: string;
  url: string;
  subItems?: NavSubItem[];
}

export interface AboutSubItem {
  name: string;
  url: string;
}
