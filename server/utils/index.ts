export interface Rule {
  id: string;
  name: string;
  type: string;
  text: string;
  summary: string;
  additionalContent: AdditionalContent[];
  evergreen: boolean;
  textContent: string;
}

export interface AdditionalContent {
  text: string;
  type: string;
}
