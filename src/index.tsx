import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

// 支持的社媒平台
export const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'x',
  'tiktok',
  'youtube',
  'whatsapp',
  'threads',
  'linkedin',
  'discord',
  'snapchat',
  'telegram',
  'reddit',
  'twitch',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

// 图标类别
export const ICON_STYLES = [
  'no-border-black', // 深色 (Glyph Dark) -> glyph-dark
  'no-border-white', // 浅色 (Glyph Light) -> glyph-light
  'origin-colorful', // 面性·彩色 (Circular Dynamic Color) -> circular-dynamic-color
  'with-border-black', // 面性·深色 (Circular Dark) -> circular-dark
  'with-border-white', // 面性·浅色 (Circular Light) -> circular-light
  'with-border-line-colorful', // 线性·彩色 (Circular Outline Color) -> circular-outline-color
  'with-border-line-black', // 线性·黑白 (Circular Outline Dark) -> circular-outline-dark
  'with-border-line-white', // 线性·浅色 (Circular Outline Light) -> circular-outline-light
  'standard', // 标准 (Standard) -> standard
] as const;

export type IconStyle = (typeof ICON_STYLES)[number];

export const SocialsPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      // 选中的社媒平台列表
      platforms: z.array(z.enum(SOCIAL_PLATFORMS as unknown as [string, ...string[]])).optional().nullable(),
      // 图标类别
      iconStyle: z.enum(ICON_STYLES as unknown as [string, ...string[]]).optional().nullable(),
      // 图标大小
      iconSize: z.number().optional().nullable(),
      // 每个平台的配置
      socials: z
        .array(
          z.object({
            platform: z.enum(SOCIAL_PLATFORMS as unknown as [string, ...string[]]),
            url: z.string().optional().nullable(),
            width: z.number().optional().nullable(),
            height: z.number().optional().nullable(),
          })
        )
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export type SocialsProps = z.infer<typeof SocialsPropsSchema>;

export const SocialsPropsDefaults = {
  platforms: ['facebook', 'instagram', 'x'],
  iconStyle: 'origin-colorful' as IconStyle,
  iconSize: 24,
  socials: [],
};

// 图标样式到目录名称的映射
// const ICON_STYLE_TO_DIR: Record<IconStyle, string> = {
//   'no-border-black': 'glyph-dark',
//   'no-border-white': 'glyph-light',
//   'origin-colorful': 'circular-dynamic-color',
//   'with-border-black': 'circular-dark',
//   'with-border-white': 'circular-light',
//   'with-border-line-colorful': 'circular-outline-color',
//   'with-border-line-black': 'circular-outline-dark',
//   'with-border-line-white': 'circular-outline-light',
//   'standard': 'standard',
// };

// 导入所有文件夹的 base64 数据
// @ts-ignore
import { iconBase64Map as circularDarkMap } from '../png/circular-dark/index';
// @ts-ignore
import { iconBase64Map as circularDynamicColorMap } from '../png/circular-dynamic-color/index';
// @ts-ignore
import { iconBase64Map as circularLightMap } from '../png/circular-light/index';
// @ts-ignore
import { iconBase64Map as circularOutlineColorMap } from '../png/circular-outline-color/index';
// @ts-ignore
import { iconBase64Map as circularOutlineDarkMap } from '../png/circular-outline-dark/index';
// @ts-ignore
import { iconBase64Map as circularOutlineLightMap } from '../png/circular-outline-light/index';
// @ts-ignore
import { iconBase64Map as glyphDarkMap } from '../png/glyph-dark/index';
// @ts-ignore
import { iconBase64Map as glyphLightMap } from '../png/glyph-light/index';
// @ts-ignore
import { iconBase64Map as standardMap } from '../png/standard/index';

// 映射图标样式到 base64 数据
const iconStyleToBase64Map: Record<IconStyle, Record<string, string>> = {
  'no-border-black': glyphDarkMap,  // 根据 ICON_STYLE_TO_DIR 映射
  'no-border-white': glyphLightMap,
  'origin-colorful': circularDynamicColorMap,
  'with-border-black': circularDarkMap,
  'with-border-white': circularLightMap,
  'with-border-line-colorful': circularOutlineColorMap,
  'with-border-line-black': circularOutlineDarkMap,
  'with-border-line-white': circularOutlineLightMap,
  'standard': standardMap,
};

// 注意：getIconBase64 函数已移除，现在直接使用预生成的 base64 数据

export function Socials({ style, props }: SocialsProps) {
  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    padding: getPadding(style?.padding),
    width: '100%',
    boxSizing: 'border-box',
  };

  const platforms = props?.platforms || SocialsPropsDefaults.platforms;
  const iconStyle = props?.iconStyle || SocialsPropsDefaults.iconStyle;
  const iconSize = props?.iconSize ?? 36;
  const socials = props?.socials || [];
  const textAlign = style?.textAlign ?? 'center';

  // 获取每个平台的配置
  const getSocialConfig = (platform: SocialPlatform) => {
    return socials.find((s) => s.platform === platform) || {
      platform,
      url: null,
    };
  };

  // 根据 textAlign 确定 justifyContent
  const justifyContent = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';

  // 同步获取图标的 base64 数据（不使用 Hooks，兼容 SSR）
  const getIconBase64Sync = (platform: SocialPlatform, style: IconStyle): string => {
    const base64Map = iconStyleToBase64Map[style];
    if (!base64Map) {
      return '';
    }
    return base64Map[platform] || '';
  };

  // 如果有 socials 数组，直接使用 socials 数组的顺序（支持重复）
  // 如果没有 socials 数组，使用 platforms 数组（保持向后兼容）
  const platformsToRender = socials.length > 0
    ? socials.map(s => s.platform)
    : SOCIAL_PLATFORMS.filter((platform) => platforms.includes(platform));

  return (
    <div style={wStyle}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent,
        width: '100%',
      }}>
        {platformsToRender.map((platform, index) => {
          // 对于 socials 数组，直接使用对应的配置
          // 对于 platforms 数组，使用 getSocialConfig 查找配置
          const config = socials.length > 0
            ? socials[index]
            : getSocialConfig(platform as SocialPlatform);

          const iconBase64 = getIconBase64Sync(platform as SocialPlatform, iconStyle as IconStyle);
          const width = iconSize;
          const height = iconSize;

          // 使用 index 作为 key 的一部分，以支持重复的平台
          const iconKey = socials.length > 0 ? `social-${index}` : platform;

          const iconElement = iconBase64 ? (
            <img
              key={iconKey}
              src={iconBase64}
              alt={platform}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                display: 'block',
              }}
            />
          ) : (
            <span
              key={iconKey}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#666',
              }}
            >
              {platform.substring(0, 2).toUpperCase()}
            </span>
          );

          // 如果有链接，包装在 <a> 标签中
          if (config.url) {
            return (
              <a
                key={iconKey}
                href={config.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', textDecoration: 'none' }}
              >
                {iconElement}
              </a>
            );
          }

          return iconElement;
        })}
      </div>
    </div>
  );
}
