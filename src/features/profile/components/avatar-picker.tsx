import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { avatarUrl, pickAvatar, removeAvatar, uploadAvatar } from '@/features/profile/data/avatar';
import { PencilGlyph } from '@/shared/ui/icons';
import { Avatar } from '@/shared/ui/illustration';
import { Spinner } from '@/shared/ui/spinner';
import { Tap } from '@/shared/ui/tap';

/**
 * The profile picture on Profil: tapping it opens the photo picker, uploads the crop to the
 * `avatars` bucket and stores the new object path on the profile. The old file is deleted only
 * after the new path is saved, so a failed upload always leaves the previous picture in place.
 *
 * The picked file is shown straight away instead of waiting for the uploaded object to be
 * readable from the CDN, which is what made a new picture appear only after an app restart.
 */
export function AvatarPicker({ size = 62 }: { size?: number }) {
  const { t } = useTranslation();
  const { session, update } = useSession();
  const [busy, setBusy] = useState(false);
  /** Local file URI of the picture being uploaded, kept afterwards so it never flickers back. */
  const [preview, setPreview] = useState<string | null>(null);

  const change = async () => {
    if (busy) return;
    const asset = await pickAvatar();
    if (!asset || !session.userId) return;
    setBusy(true);
    setPreview(asset.uri);
    const previous = session.avatarPath;
    try {
      const path = await uploadAvatar(session.userId, asset);
      update({ avatarPath: path });
      if (previous !== path) await removeAvatar(previous);
    } catch {
      // `update` never ran, so the profile still points at the picture that is still there.
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const badge = Math.round(size * 0.37);
  return (
    <Tap
      haptic="light"
      onPress={() => void change()}
      accessibilityLabel={t('profile.avatar.change')}
      style={{ width: size, height: size }}
    >
      <Avatar size={size} uri={preview ?? avatarUrl(session.avatarPath)} />
      {busy ? (
        <View
          className="absolute items-center justify-center rounded-full"
          style={{ width: size, height: size, backgroundColor: 'rgba(43,39,65,.45)' }}
        >
          <Spinner size={Math.round(size * 0.4)} color="#fff" />
        </View>
      ) : (
        <View
          className="absolute bottom-0 right-0 items-center justify-center rounded-full bg-accent-800"
          style={{ width: badge, height: badge, borderWidth: 2, borderColor: '#fff' }}
        >
          <PencilGlyph size={Math.round(badge * 0.55)} />
        </View>
      )}
    </Tap>
  );
}
