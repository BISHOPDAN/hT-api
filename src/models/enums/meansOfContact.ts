export enum MeansOfContact {
  AUDIO_CALL = 'audio_call',
  VIDEO_CALL = 'video_call',
  CHAT = 'chat',
}

export const validateMeansOfContact = (
  meansOfContact: MeansOfContact
): boolean => {
  return Object.values(MeansOfContact).includes(meansOfContact);
};
