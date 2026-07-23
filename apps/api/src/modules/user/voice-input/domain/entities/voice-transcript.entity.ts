export type VoiceTranscriptEntityProps = {
  text: string;
  language: string | null;
};

export class VoiceTranscriptEntity {
  readonly text: string;
  readonly language: string | null;

  constructor(props: VoiceTranscriptEntityProps) {
    this.text = props.text.trim();
    this.language = props.language;
  }
}
