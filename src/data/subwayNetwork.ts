import { SubwayStation } from '../types/game';

export interface SubwayEdge {
  from: string;
  to: string;
  line: string; // e.g. "1", "A", "4", "L", "7"
  color: string;
  minutes: number;
}

export const MTA_LINE_COLORS: Record<string, string> = {
  '1': '#EE352E',
  '2': '#EE352E',
  '3': '#EE352E',
  '4': '#00933C',
  '5': '#00933C',
  '6': '#00933C',
  'A': '#0039A6',
  'C': '#0039A6',
  'E': '#0039A6',
  'B': '#FF6319',
  'D': '#FF6319',
  'F': '#FF6319',
  'M': '#FF6319',
  'N': '#FCCC0A',
  'Q': '#FCCC0A',
  'R': '#FCCC0A',
  'W': '#FCCC0A',
  'L': '#A7A9AC',
  '7': '#B933AD',
  'S': '#808183',
  'Walk': '#94A3B8',
};

export const SUBWAY_STATIONS: SubwayStation[] = [
  // Red Line (1/2/3 - 7th Ave / Broadway)
  { id: 'st_south_ferry', name: 'South Ferry', coordinates: [-74.013, 40.702], lines: ['1'] },
  { id: 'st_fulton_red', name: 'Fulton St', coordinates: [-74.009, 40.710], lines: ['2', '3'] },
  { id: 'st_chambers_red', name: 'Chambers St', coordinates: [-74.008, 40.715], lines: ['1', '2', '3'] },
  { id: 'st_canal_red', name: 'Canal St', coordinates: [-74.006, 40.723], lines: ['1'] },
  { id: 'st_houston_red', name: 'Houston St', coordinates: [-74.005, 40.728], lines: ['1'] },
  { id: 'st_christopher_red', name: 'Christopher St (West Village)', coordinates: [-74.003, 40.733], lines: ['1'] },
  { id: 'st_14_red', name: '14 St (7th Ave)', coordinates: [-73.999, 40.738], lines: ['1', '2', '3'] },
  { id: 'st_23_red', name: '23 St (Chelsea)', coordinates: [-73.996, 40.744], lines: ['1'] },
  { id: 'st_34_penn_red', name: '34 St - Penn Station', coordinates: [-73.991, 40.750], lines: ['1', '2', '3'] },
  { id: 'st_times_sq_red', name: 'Times Sq - 42 St', coordinates: [-73.987, 40.755], lines: ['1', '2', '3'] },
  { id: 'st_50_red', name: '50 St', coordinates: [-73.984, 40.762], lines: ['1'] },
  { id: 'st_59_columbus_red', name: '59 St - Columbus Circle', coordinates: [-73.982, 40.768], lines: ['1'] },
  { id: 'st_72_red', name: '72 St (UWS)', coordinates: [-73.982, 40.778], lines: ['1', '2', '3'] },
  { id: 'st_79_red', name: '79 St', coordinates: [-73.980, 40.784], lines: ['1'] },
  { id: 'st_86_red', name: '86 St', coordinates: [-73.976, 40.789], lines: ['1'] },
  { id: 'st_96_red', name: '96 St', coordinates: [-73.972, 40.794], lines: ['1', '2', '3'] },
  { id: 'st_116_columbia', name: '116 St - Columbia Univ', coordinates: [-73.964, 40.808], lines: ['1'] },
  { id: 'st_125_red', name: '125 St (Harlem)', coordinates: [-73.958, 40.816], lines: ['1'] },
  { id: 'st_145_red', name: '145 St (Hamilton Heights)', coordinates: [-73.950, 40.825], lines: ['1'] },
  { id: 'st_168_red', name: '168 St (Washington Heights)', coordinates: [-73.940, 40.841], lines: ['1'] },
  { id: 'st_181_red', name: '181 St', coordinates: [-73.934, 40.850], lines: ['1'] },
  { id: 'st_207_red', name: '207 St - Inwood', coordinates: [-73.921, 40.867], lines: ['1'] },

  // Green Line (4/5/6 - Lexington Ave)
  { id: 'st_bowling_green', name: 'Bowling Green (FiDi)', coordinates: [-74.014, 40.704], lines: ['4', '5'] },
  { id: 'st_wall_green', name: 'Wall St', coordinates: [-74.009, 40.707], lines: ['4', '5'] },
  { id: 'st_fulton_green', name: 'Fulton St', coordinates: [-74.007, 40.710], lines: ['4', '5'] },
  { id: 'st_brooklyn_bridge', name: 'Brooklyn Bridge - City Hall', coordinates: [-74.004, 40.713], lines: ['4', '5', '6'] },
  { id: 'st_canal_green', name: 'Canal St', coordinates: [-74.000, 40.718], lines: ['6'] },
  { id: 'st_spring_green', name: 'Spring St (SoHo/Nolita)', coordinates: [-73.997, 40.722], lines: ['6'] },
  { id: 'st_bleecker_green', name: 'Bleecker St (NoHo)', coordinates: [-73.994, 40.726], lines: ['6'] },
  { id: 'st_astor_green', name: 'Astor Pl (East Village)', coordinates: [-73.991, 40.730], lines: ['6'] },
  { id: 'st_union_sq_green', name: '14 St - Union Square', coordinates: [-73.990, 40.735], lines: ['4', '5', '6'] },
  { id: 'st_23_green', name: '23 St (Gramercy/Flatiron)', coordinates: [-73.986, 40.741], lines: ['6'] },
  { id: 'st_28_green', name: '28 St', coordinates: [-73.984, 40.743], lines: ['6'] },
  { id: 'st_33_green', name: '33 St (Murray Hill)', coordinates: [-73.982, 40.746], lines: ['6'] },
  { id: 'st_grand_central_green', name: 'Grand Central - 42 St', coordinates: [-73.977, 40.752], lines: ['4', '5', '6'] },
  { id: 'st_51_green', name: '51 St (Midtown East)', coordinates: [-73.972, 40.757], lines: ['6'] },
  { id: 'st_59_lex_green', name: '59 St - Lexington Ave', coordinates: [-73.968, 40.763], lines: ['4', '5', '6'] },
  { id: 'st_68_hunter', name: '68 St - Hunter College (UES)', coordinates: [-73.964, 40.768], lines: ['6'] },
  { id: 'st_77_green', name: '77 St (UES)', coordinates: [-73.959, 40.774], lines: ['6'] },
  { id: 'st_86_green', name: '86 St (UES)', coordinates: [-73.956, 40.779], lines: ['4', '5', '6'] },
  { id: 'st_96_green', name: '96 St (UES)', coordinates: [-73.952, 40.786], lines: ['6'] },
  { id: 'st_110_green', name: '110 St (East Harlem)', coordinates: [-73.944, 40.795], lines: ['6'] },
  { id: 'st_125_green', name: '125 St (East Harlem)', coordinates: [-73.938, 40.804], lines: ['4', '5', '6'] },

  // Blue Line (A/C/E - 8th Ave)
  { id: 'st_fulton_blue', name: 'Fulton St', coordinates: [-74.009, 40.710], lines: ['A', 'C'] },
  { id: 'st_chambers_blue', name: 'Chambers St / WTC', coordinates: [-74.009, 40.713], lines: ['A', 'C', 'E'] },
  { id: 'st_canal_blue', name: 'Canal St', coordinates: [-74.004, 40.721], lines: ['A', 'C', 'E'] },
  { id: 'st_spring_blue', name: 'Spring St (SoHo)', coordinates: [-74.004, 40.726], lines: ['C', 'E'] },
  { id: 'st_west_4_blue', name: 'West 4 St - Washington Sq', coordinates: [-74.001, 40.731], lines: ['A', 'C', 'E'] },
  { id: 'st_14_blue', name: '14 St - 8 Ave', coordinates: [-74.001, 40.740], lines: ['A', 'C', 'E'] },
  { id: 'st_23_blue', name: '23 St (Chelsea)', coordinates: [-73.998, 40.746], lines: ['C', 'E'] },
  { id: 'st_34_penn_blue', name: '34 St - Penn Station', coordinates: [-73.993, 40.752], lines: ['A', 'C', 'E'] },
  { id: 'st_42_port_auth', name: '42 St - Port Authority', coordinates: [-73.989, 40.757], lines: ['A', 'C', 'E'] },
  { id: 'st_50_blue', name: '50 St', coordinates: [-73.986, 40.762], lines: ['C', 'E'] },
  { id: 'st_59_columbus_blue', name: '59 St - Columbus Circle', coordinates: [-73.982, 40.768], lines: ['A', 'C'] },
  { id: 'st_72_blue', name: '72 St', coordinates: [-73.976, 40.776], lines: ['B', 'C'] },
  { id: 'st_81_museum', name: '81 St - Museum of Nat Hist', coordinates: [-73.973, 40.781], lines: ['B', 'C'] },
  { id: 'st_86_blue', name: '86 St', coordinates: [-73.969, 40.786], lines: ['B', 'C'] },
  { id: 'st_96_blue', name: '96 St', coordinates: [-73.967, 40.792], lines: ['B', 'C'] },
  { id: 'st_125_blue', name: '125 St (Harlem)', coordinates: [-73.952, 40.811], lines: ['A', 'C'] },
  { id: 'st_145_blue', name: '145 St', coordinates: [-73.944, 40.825], lines: ['A', 'C'] },
  { id: 'st_168_blue', name: '168 St', coordinates: [-73.940, 40.841], lines: ['A', 'C'] },
  { id: 'st_175_blue', name: '175 St (GW Bridge)', coordinates: [-73.937, 40.847], lines: ['A'] },
  { id: 'st_190_blue', name: '190 St (Fort Tryon)', coordinates: [-73.934, 40.859], lines: ['A'] },
  { id: 'st_207_inwood', name: 'Inwood - 207 St', coordinates: [-73.924, 40.868], lines: ['A'] },

  // Orange Line (B/D/F/M - 6th Ave)
  { id: 'st_delancey_orange', name: 'Delancey St - Essex St (LES)', coordinates: [-73.989, 40.718], lines: ['F'] },
  { id: 'st_broadway_lafayette', name: 'Broadway-Lafayette (NoHo)', coordinates: [-73.996, 40.725], lines: ['B', 'D', 'F', 'M'] },
  { id: 'st_14_orange', name: '14 St - 6 Ave', coordinates: [-73.996, 40.738], lines: ['F', 'M'] },
  { id: 'st_23_orange', name: '23 St (Flatiron)', coordinates: [-73.993, 40.743], lines: ['F', 'M'] },
  { id: 'st_34_herald_orange', name: '34 St - Herald Sq', coordinates: [-73.988, 40.749], lines: ['B', 'D', 'F', 'M'] },
  { id: 'st_42_bryant_orange', name: '42 St - Bryant Park', coordinates: [-73.984, 40.754], lines: ['B', 'D', 'F', 'M'] },
  { id: 'st_47_50_rockefeller', name: '47-50 Sts - Rockefeller Ctr', coordinates: [-73.979, 40.759], lines: ['B', 'D', 'F', 'M'] },

  // Yellow Line (N/Q/R/W - Broadway & 2nd Ave)
  { id: 'st_whitehall', name: 'Whitehall St (South Ferry)', coordinates: [-74.013, 40.702], lines: ['R', 'W'] },
  { id: 'st_rector_yellow', name: 'Rector St', coordinates: [-74.013, 40.707], lines: ['R', 'W'] },
  { id: 'st_city_hall', name: 'City Hall', coordinates: [-74.006, 40.713], lines: ['R', 'W'] },
  { id: 'st_canal_yellow', name: 'Canal St', coordinates: [-74.001, 40.719], lines: ['N', 'Q', 'R', 'W'] },
  { id: 'st_prince_yellow', name: 'Prince St (SoHo)', coordinates: [-73.998, 40.724], lines: ['R', 'W'] },
  { id: 'st_8_nyu', name: '8 St - NYU', coordinates: [-73.993, 40.730], lines: ['R', 'W'] },
  { id: 'st_union_sq_yellow', name: '14 St - Union Sq', coordinates: [-73.990, 40.735], lines: ['N', 'Q', 'R', 'W'] },
  { id: 'st_23_yellow', name: '23 St (Flatiron)', coordinates: [-73.990, 40.741], lines: ['R', 'W'] },
  { id: 'st_28_yellow', name: '28 St', coordinates: [-73.988, 40.745], lines: ['R', 'W'] },
  { id: 'st_times_sq_yellow', name: 'Times Sq - 42 St', coordinates: [-73.987, 40.755], lines: ['N', 'Q', 'R', 'W'] },
  { id: 'st_57_7_yellow', name: '57 St - 7 Ave', coordinates: [-73.980, 40.765], lines: ['N', 'Q', 'R', 'W'] },
  { id: 'st_72_2nd', name: '72 St (2nd Ave - UES)', coordinates: [-73.958, 40.769], lines: ['Q'] },
  { id: 'st_86_2nd', name: '86 St (2nd Ave - UES)', coordinates: [-73.952, 40.778], lines: ['Q'] },
  { id: 'st_96_2nd', name: '96 St (2nd Ave - UES)', coordinates: [-73.947, 40.784], lines: ['Q'] },

  // Gray Line (L - 14th St Crosstown)
  { id: 'st_8_ave_l', name: '8 Ave / 14 St', coordinates: [-74.001, 40.740], lines: ['L'] },
  { id: 'st_6_ave_l', name: '6 Ave / 14 St', coordinates: [-73.996, 40.738], lines: ['L'] },
  { id: 'st_union_sq_l', name: 'Union Sq / 14 St', coordinates: [-73.990, 40.735], lines: ['L'] },
  { id: 'st_3_ave_l', name: '3 Ave / 14 St', coordinates: [-73.986, 40.733], lines: ['L'] },
  { id: 'st_1_ave_l', name: '1 Ave / 14 St (East Village)', coordinates: [-73.981, 40.731], lines: ['L'] },

  // Purple Line (7 - 42nd St Crosstown)
  { id: 'st_34_hudson_yards', name: '34 St - Hudson Yards', coordinates: [-74.002, 40.755], lines: ['7'] },
  { id: 'st_times_sq_7', name: 'Times Sq - 42 St', coordinates: [-73.987, 40.755], lines: ['7'] },
  { id: 'st_bryant_park_7', name: '5 Ave / Bryant Park', coordinates: [-73.982, 40.753], lines: ['7'] },
  { id: 'st_grand_central_7', name: 'Grand Central - 42 St', coordinates: [-73.977, 40.752], lines: ['7'] },
];

export const SUBWAY_STATIONS_MAP = new Map<string, SubwayStation>(
  SUBWAY_STATIONS.map((s) => [s.id, s])
);

// Sequence tracks connecting adjacent stations
function createLineTrack(stationIds: string[], line: string, color: string): SubwayEdge[] {
  const edges: SubwayEdge[] = [];
  for (let i = 0; i < stationIds.length - 1; i++) {
    const from = stationIds[i];
    const to = stationIds[i + 1];
    edges.push(
      { from, to, line, color, minutes: 2 },
      { from: to, to: from, line, color, minutes: 2 }
    );
  }
  return edges;
}

export const SUBWAY_EDGES: SubwayEdge[] = [
  // 1/2/3 Red Track
  ...createLineTrack([
    'st_south_ferry', 'st_fulton_red', 'st_chambers_red', 'st_canal_red',
    'st_houston_red', 'st_christopher_red', 'st_14_red', 'st_23_red',
    'st_34_penn_red', 'st_times_sq_red', 'st_50_red', 'st_59_columbus_red',
    'st_72_red', 'st_79_red', 'st_86_red', 'st_96_red', 'st_116_columbia',
    'st_125_red', 'st_145_red', 'st_168_red', 'st_181_red', 'st_207_red'
  ], '1', '#EE352E'),

  // 4/5/6 Green Track
  ...createLineTrack([
    'st_bowling_green', 'st_wall_green', 'st_fulton_green', 'st_brooklyn_bridge',
    'st_canal_green', 'st_spring_green', 'st_bleecker_green', 'st_astor_green',
    'st_union_sq_green', 'st_23_green', 'st_28_green', 'st_33_green',
    'st_grand_central_green', 'st_51_green', 'st_59_lex_green', 'st_68_hunter',
    'st_77_green', 'st_86_green', 'st_96_green', 'st_110_green', 'st_125_green'
  ], '4', '#00933C'),

  // A/C/E Blue Track
  ...createLineTrack([
    'st_fulton_blue', 'st_chambers_blue', 'st_canal_blue', 'st_spring_blue',
    'st_west_4_blue', 'st_14_blue', 'st_23_blue', 'st_34_penn_blue',
    'st_42_port_auth', 'st_50_blue', 'st_59_columbus_blue', 'st_72_blue',
    'st_81_museum', 'st_86_blue', 'st_96_blue', 'st_125_blue', 'st_145_blue',
    'st_168_blue', 'st_175_blue', 'st_190_blue', 'st_207_inwood'
  ], 'A', '#0039A6'),

  // B/D/F/M Orange Track
  ...createLineTrack([
    'st_delancey_orange', 'st_broadway_lafayette', 'st_14_orange', 'st_23_orange',
    'st_34_herald_orange', 'st_42_bryant_orange', 'st_47_50_rockefeller'
  ], 'F', '#FF6319'),

  // N/Q/R/W Yellow Track
  ...createLineTrack([
    'st_whitehall', 'st_rector_yellow', 'st_city_hall', 'st_canal_yellow',
    'st_prince_yellow', 'st_8_nyu', 'st_union_sq_yellow', 'st_23_yellow',
    'st_28_yellow', 'st_times_sq_yellow', 'st_57_7_yellow', 'st_72_2nd',
    'st_86_2nd', 'st_96_2nd'
  ], 'N', '#FCCC0A'),

  // L Gray Track (14th St Crosstown)
  ...createLineTrack([
    'st_8_ave_l', 'st_6_ave_l', 'st_union_sq_l', 'st_3_ave_l', 'st_1_ave_l'
  ], 'L', '#A7A9AC'),

  // 7 Purple Track (42nd St Crosstown)
  ...createLineTrack([
    'st_34_hudson_yards', 'st_times_sq_7', 'st_bryant_park_7', 'st_grand_central_7'
  ], '7', '#B933AD'),

  // Major station complex pedestrian transfers (~3-4 min transfer penalty)
  // Times Square Complex (Red, Yellow, Purple, Port Authority Blue)
  { from: 'st_times_sq_red', to: 'st_times_sq_yellow', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_times_sq_yellow', to: 'st_times_sq_red', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_times_sq_red', to: 'st_times_sq_7', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_times_sq_7', to: 'st_times_sq_red', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_times_sq_red', to: 'st_42_port_auth', line: 'Transfer', color: '#94A3B8', minutes: 4 },
  { from: 'st_42_port_auth', to: 'st_times_sq_red', line: 'Transfer', color: '#94A3B8', minutes: 4 },

  // Union Square Complex (Green, Yellow, L)
  { from: 'st_union_sq_green', to: 'st_union_sq_yellow', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_union_sq_yellow', to: 'st_union_sq_green', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_union_sq_green', to: 'st_union_sq_l', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_union_sq_l', to: 'st_union_sq_green', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_union_sq_yellow', to: 'st_union_sq_l', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_union_sq_l', to: 'st_union_sq_yellow', line: 'Transfer', color: '#94A3B8', minutes: 3 },

  // 14 St 8 Ave (Blue & L)
  { from: 'st_14_blue', to: 'st_8_ave_l', line: 'Transfer', color: '#94A3B8', minutes: 2 },
  { from: 'st_8_ave_l', to: 'st_14_blue', line: 'Transfer', color: '#94A3B8', minutes: 2 },

  // 14 St 6 Ave (Orange & L)
  { from: 'st_14_orange', to: 'st_6_ave_l', line: 'Transfer', color: '#94A3B8', minutes: 2 },
  { from: 'st_6_ave_l', to: 'st_14_orange', line: 'Transfer', color: '#94A3B8', minutes: 2 },

  // Grand Central Complex (Green & Purple)
  { from: 'st_grand_central_green', to: 'st_grand_central_7', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_grand_central_7', to: 'st_grand_central_green', line: 'Transfer', color: '#94A3B8', minutes: 3 },

  // Columbus Circle (Red & Blue)
  { from: 'st_59_columbus_red', to: 'st_59_columbus_blue', line: 'Transfer', color: '#94A3B8', minutes: 2 },
  { from: 'st_59_columbus_blue', to: 'st_59_columbus_red', line: 'Transfer', color: '#94A3B8', minutes: 2 },

  // Fulton Street Complex (Red, Green, Blue)
  { from: 'st_fulton_red', to: 'st_fulton_green', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_fulton_green', to: 'st_fulton_red', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_fulton_red', to: 'st_fulton_blue', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_fulton_blue', to: 'st_fulton_red', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_fulton_green', to: 'st_fulton_blue', line: 'Transfer', color: '#94A3B8', minutes: 3 },
  { from: 'st_fulton_blue', to: 'st_fulton_green', line: 'Transfer', color: '#94A3B8', minutes: 3 },

  // West 4 St (Blue & Orange)
  { from: 'st_west_4_blue', to: 'st_broadway_lafayette', line: 'Transfer', color: '#94A3B8', minutes: 4 },
  { from: 'st_broadway_lafayette', to: 'st_west_4_blue', line: 'Transfer', color: '#94A3B8', minutes: 4 },
];
