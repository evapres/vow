import M3FilledSelect from "@/app/components/m3/M3FilledSelect";
import M3FilledTextField from "@/app/components/m3/M3FilledTextField";
import type { GreekArticle } from "@/lib/coupleNamesForm";

type EnglishFieldsProps = {
  language: "en";
  person1Name: string;
  person2Name: string;
  onPerson1NameChange: (value: string) => void;
  onPerson2NameChange: (value: string) => void;
  person1Placeholder: string;
  person2Placeholder: string;
};

type GreekFieldsProps = {
  language: "el";
  person1Article: GreekArticle;
  person1Name: string;
  person2Article: GreekArticle;
  person2Name: string;
  onPerson1ArticleChange: (value: GreekArticle) => void;
  onPerson1NameChange: (value: string) => void;
  onPerson2ArticleChange: (value: GreekArticle) => void;
  onPerson2NameChange: (value: string) => void;
  person1NamePlaceholder: string;
  person2NamePlaceholder: string;
};

export type CoupleNamesFormFieldsProps = EnglishFieldsProps | GreekFieldsProps;

export default function CoupleNamesFormFields(props: CoupleNamesFormFieldsProps) {
  if (props.language === "el") {
    return (
      <fieldset className="space-y-4">
        <legend className="sr-only">Couple names</legend>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">
            Name 1
          </p>
          <div className="grid gap-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
            <M3FilledSelect
              id="couple_person_1_article"
              name="couple_person_1_article"
              label="Noun"
              value={props.person1Article}
              onChange={(e) =>
                props.onPerson1ArticleChange(e.target.value === "η" ? "η" : "ο")
              }
            >
              <option value="ο">ο</option>
              <option value="η">η</option>
            </M3FilledSelect>
            <M3FilledTextField
              id="couple_person_1_name"
              name="couple_person_1_name"
              label="Name"
              type="text"
              required
              clearable
              value={props.person1Name}
              onChange={(e) => props.onPerson1NameChange(e.target.value)}
              onClear={() => props.onPerson1NameChange("")}
              placeholder={props.person1NamePlaceholder}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">
            Name 2
          </p>
          <div className="grid gap-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
            <M3FilledSelect
              id="couple_person_2_article"
              name="couple_person_2_article"
              label="Noun"
              value={props.person2Article}
              onChange={(e) =>
                props.onPerson2ArticleChange(e.target.value === "η" ? "η" : "ο")
              }
            >
              <option value="ο">ο</option>
              <option value="η">η</option>
            </M3FilledSelect>
            <M3FilledTextField
              id="couple_person_2_name"
              name="couple_person_2_name"
              label="Name"
              type="text"
              required
              clearable
              value={props.person2Name}
              onChange={(e) => props.onPerson2NameChange(e.target.value)}
              onClear={() => props.onPerson2NameChange("")}
              placeholder={props.person2NamePlaceholder}
            />
          </div>
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Couple names</legend>

      <M3FilledTextField
        id="couple_person_1_name"
        name="couple_person_1_name"
        label="Name 1"
        type="text"
        required
        clearable
        value={props.person1Name}
        onChange={(e) => props.onPerson1NameChange(e.target.value)}
        onClear={() => props.onPerson1NameChange("")}
        placeholder={props.person1Placeholder}
      />

      <M3FilledTextField
        id="couple_person_2_name"
        name="couple_person_2_name"
        label="Name 2"
        type="text"
        required
        clearable
        value={props.person2Name}
        onChange={(e) => props.onPerson2NameChange(e.target.value)}
        onClear={() => props.onPerson2NameChange("")}
        placeholder={props.person2Placeholder}
      />
    </fieldset>
  );
}
