// A delimiter is solid over its entire span, including the spaces between its posts.
export function boundarySegment(ax,az,bx,bz,thickness=.09,kind='barrier'){
 return {kind,x:(ax+bx)/2,z:(az+bz)/2,w:Math.hypot(bx-ax,bz-az),d:thickness,angle:Math.atan2(bz-az,bx-ax)};
}
