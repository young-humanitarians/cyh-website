import { geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import topology from 'world-atlas/countries-110m.json' with { type: 'json' };

/**
 * Builds the member-origin world map as a plain SVG at build time.
 *
 * Rendering the projection here rather than in the browser means the map ships
 * as static markup: no map library reaches the client, it prints, it works
 * with JavaScript disabled, and the highlighted countries are also exposed as
 * a text list for screen readers (see MapBlock.astro).
 */

const WIDTH = 960;
const HEIGHT = 500;

export interface CountryShape {
  name: string;
  d: string;
  highlighted: boolean;
}

export interface WorldMap {
  width: number;
  height: number;
  shapes: CountryShape[];
  /** Names that were requested but do not exist in the atlas. */
  unknown: string[];
}

interface CountryProperties {
  name: string;
}

// `feature()` is typed loosely upstream; the atlas object is known to be a
// FeatureCollection of countries carrying a `name` property.
const collection = feature(
  topology as never,
  (topology as never as { objects: { countries: unknown } }).objects.countries as never,
) as unknown as FeatureCollection<Geometry, CountryProperties>;

const projection: GeoProjection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], collection);
const toPath = geoPath(projection);

/** All country names the atlas knows, for validating content. */
export const atlasCountryNames: ReadonlySet<string> = new Set(
  collection.features.map((f) => f.properties.name),
);

export function buildWorldMap(highlight: readonly string[]): WorldMap {
  const wanted = new Set(highlight);
  const unknown = [...wanted].filter((name) => !atlasCountryNames.has(name)).sort();

  const shapes = collection.features
    .filter((f) => f.properties.name !== 'Antarctica')
    .map((f) => ({
      name: f.properties.name,
      d: toPath(f) ?? '',
      highlighted: wanted.has(f.properties.name),
    }))
    .filter((shape) => shape.d !== '');

  return { width: WIDTH, height: HEIGHT, shapes, unknown };
}
