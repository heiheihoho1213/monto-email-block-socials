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

// 导入所有文件夹的 cdn url 数据
// @ts-ignore
import { iconCdnUrlMap as circularDarkMap } from '../png/circular-dark/index';
// @ts-ignore
import { iconCdnUrlMap as circularDynamicColorMap } from '../png/circular-dynamic-color/index';
// @ts-ignore
import { iconCdnUrlMap as circularLightMap } from '../png/circular-light/index';
// @ts-ignore
import { iconCdnUrlMap as circularOutlineColorMap } from '../png/circular-outline-color/index';
// @ts-ignore
import { iconCdnUrlMap as circularOutlineDarkMap } from '../png/circular-outline-dark/index';
// @ts-ignore
import { iconCdnUrlMap as circularOutlineLightMap } from '../png/circular-outline-light/index';
// @ts-ignore
import { iconCdnUrlMap as glyphDarkMap } from '../png/glyph-dark/index';
// @ts-ignore
import { iconCdnUrlMap as glyphLightMap } from '../png/glyph-light/index';
// @ts-ignore
import { iconCdnUrlMap as standardMap } from '../png/standard/index';

// 映射图标样式到 cdn url 数据
const iconStyleToCdnUrlMap: Record<IconStyle, Record<string, string>> = {
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

  // 根据 textAlign 确定 table 对齐方式
  const tableAlign = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'right' : 'left';

  // 同步获取图标的 base64 数据（不使用 Hooks，兼容 SSR）
  const getIconCdnUrlSync = (platform: SocialPlatform, style: IconStyle): string => {
    const cdnUrlMap = iconStyleToCdnUrlMap[style];
    if (!cdnUrlMap) {
      return '';
    }
    return cdnUrlMap[platform] || '';
  };

  // 如果有 socials 数组，直接使用 socials 数组的顺序（支持重复）
  // 如果没有 socials 数组，使用 platforms 数组（保持向后兼容）
  const platformsToRender = socials.length > 0
    ? socials.map(s => s.platform)
    : SOCIAL_PLATFORMS.filter((platform) => platforms.includes(platform));

  // 计算每个 td 的宽度（iconSize + 左右 padding 8px）
  const tdWidth = iconSize;
  // 计算内层 table 的总宽度（所有 td 宽度之和）
  const innerTableWidth = platformsToRender.length * tdWidth;

  return (
    <div style={wStyle}>
      {/* 外层 table 用于居中 */}
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border={0}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          <tr>
            <td align={tableAlign} style={{ padding: 0 }}>
              {/* 内层 table 固定宽度，包含实际的图标 */}
              <table
                width={innerTableWidth}
                cellPadding="0"
                cellSpacing="0"
                border={0}
                align={tableAlign}
                style={{
                  width: `${innerTableWidth}px`,
                  borderCollapse: 'collapse',
                  margin: '0 auto',
                }}
              >
                <tbody>
                  <tr>
                    {platformsToRender.map((platform, index) => {
                      // 对于 socials 数组，直接使用对应的配置
                      // 对于 platforms 数组，使用 getSocialConfig 查找配置
                      const config = socials.length > 0
                        ? socials[index]
                        : getSocialConfig(platform as SocialPlatform);

                      const iconCdnUrl = getIconCdnUrlSync(platform as SocialPlatform, iconStyle as IconStyle);
                      const width = iconSize;
                      const height = iconSize;

                      // 使用 index 作为 key 的一部分，以支持重复的平台
                      const iconKey = socials.length > 0 ? `social-${index}` : platform;

                      const iconElement = iconCdnUrl ? (
                        <img
                          key={iconKey}
                          src={iconCdnUrl}
                          alt={platform}
                          width={width}
                          height={height}
                          {...({ fetchpriority: 'high' } as any)} // 使用扩展运算符绕过 TypeScript 检查
                          style={{
                            width: `${width}px`,
                            height: `${height}px`,
                            display: 'block',
                            border: '0',
                          }}
                        />
                      ) : (
                        <span
                          key={iconKey}
                          style={{
                            width: `${width}px`,
                            height: `${height}px`,
                            display: 'inline-block',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            fontSize: '10px',
                            color: '#666',
                            textAlign: 'center',
                            lineHeight: `${height}px`,
                            verticalAlign: 'middle',
                          }}
                        >
                          {platform.substring(0, 2).toUpperCase()}
                        </span>
                      );

                      // 如果有链接，包装在 <a> 标签中
                      const content = config.url ? (
                        <a
                          key={iconKey}
                          href={config.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: 'none',
                            display: 'block',
                            lineHeight: 0,
                            verticalAlign: 'middle',
                          }}
                        >
                          {iconElement}
                        </a>
                      ) : (
                        iconElement
                      );

                      return (
                        <td
                          key={iconKey}
                          width={tdWidth}
                          style={{
                            width: `${tdWidth}px`,
                            padding: '0px 4px',
                            verticalAlign: 'middle',
                          }}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
