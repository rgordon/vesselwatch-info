/*
	WSFSchedTimeAdjResponse.h
	The implementation of properties and methods for the WSFSchedTimeAdjResponse object.
	Generated by SudzC.com
*/
#import "WSFSchedTimeAdjResponse.h"

#import "WSFSchedSailingDateRange.h"
#import "WSFArrayOfSchedAnnotation.h"
@implementation WSFSchedTimeAdjResponse
	@synthesize ScheduleID = _ScheduleID;
	@synthesize SchedRouteID = _SchedRouteID;
	@synthesize RouteID = _RouteID;
	@synthesize RouteDescription = _RouteDescription;
	@synthesize RouteSortSeq = _RouteSortSeq;
	@synthesize SailingID = _SailingID;
	@synthesize SailingDescription = _SailingDescription;
	@synthesize ActiveSailingDateRange = _ActiveSailingDateRange;
	@synthesize SailingDir = _SailingDir;
	@synthesize JourneyID = _JourneyID;
	@synthesize VesselID = _VesselID;
	@synthesize VesselName = _VesselName;
	@synthesize VesselHandicapAccessible = _VesselHandicapAccessible;
	@synthesize VesselPositionNum = _VesselPositionNum;
	@synthesize JourneyTerminalID = _JourneyTerminalID;
	@synthesize TerminalID = _TerminalID;
	@synthesize TerminalDescription = _TerminalDescription;
	@synthesize TerminalBriefDescription = _TerminalBriefDescription;
	@synthesize TimeToAdj = _TimeToAdj;
	@synthesize AdjDateFrom = _AdjDateFrom;
	@synthesize AdjDateThru = _AdjDateThru;
	@synthesize TidalAdj = _TidalAdj;
	@synthesize EventID = _EventID;
	@synthesize EventDescription = _EventDescription;
	@synthesize DepArrIndicator = _DepArrIndicator;
	@synthesize AdjType = _AdjType;
	@synthesize Annotations = _Annotations;

	- (id) init
	{
		if(self = [super init])
		{
			self.RouteDescription = nil;
			self.SailingDescription = nil;
			self.ActiveSailingDateRange = nil; // [[WSFSchedSailingDateRange alloc] init];
			self.SailingDir = nil;
			self.VesselName = nil;
			self.TerminalDescription = nil;
			self.TerminalBriefDescription = nil;
			self.TimeToAdj = nil;
			self.AdjDateFrom = nil;
			self.AdjDateThru = nil;
			self.EventDescription = nil;
			self.DepArrIndicator = nil;
			self.AdjType = nil;
			self.Annotations = [[NSMutableArray alloc] init];

		}
		return self;
	}

	+ (WSFSchedTimeAdjResponse*) createWithNode: (CXMLNode*) node
	{
		if(node == nil) { return nil; }
		return (WSFSchedTimeAdjResponse*)[[WSFSchedTimeAdjResponse alloc] initWithNode: node];
	}

	- (id) initWithNode: (CXMLNode*) node {
		if(self = [super initWithNode: node])
		{
			self.ScheduleID = [[Soap getNodeValue: node withName: @"ScheduleID"] intValue];
			self.SchedRouteID = [[Soap getNodeValue: node withName: @"SchedRouteID"] intValue];
			self.RouteID = [[Soap getNodeValue: node withName: @"RouteID"] intValue];
			self.RouteDescription = [Soap getNodeValue: node withName: @"RouteDescription"];
			self.RouteSortSeq = [[Soap getNodeValue: node withName: @"RouteSortSeq"] intValue];
			self.SailingID = [[Soap getNodeValue: node withName: @"SailingID"] intValue];
			self.SailingDescription = [Soap getNodeValue: node withName: @"SailingDescription"];
			self.ActiveSailingDateRange = [[WSFSchedSailingDateRange createWithNode: [Soap getNode: node withName: @"ActiveSailingDateRange"]] object];
			self.SailingDir = [Soap getNodeValue: node withName: @"SailingDir"];
			self.JourneyID = [[Soap getNodeValue: node withName: @"JourneyID"] intValue];
			self.VesselID = [[Soap getNodeValue: node withName: @"VesselID"] intValue];
			self.VesselName = [Soap getNodeValue: node withName: @"VesselName"];
			self.VesselHandicapAccessible = [[Soap getNodeValue: node withName: @"VesselHandicapAccessible"] boolValue];
			self.VesselPositionNum = [[Soap getNodeValue: node withName: @"VesselPositionNum"] intValue];
			self.JourneyTerminalID = [[Soap getNodeValue: node withName: @"JourneyTerminalID"] intValue];
			self.TerminalID = [[Soap getNodeValue: node withName: @"TerminalID"] intValue];
			self.TerminalDescription = [Soap getNodeValue: node withName: @"TerminalDescription"];
			self.TerminalBriefDescription = [Soap getNodeValue: node withName: @"TerminalBriefDescription"];
			self.TimeToAdj = [Soap dateFromString: [Soap getNodeValue: node withName: @"TimeToAdj"]];
			self.AdjDateFrom = [Soap dateFromString: [Soap getNodeValue: node withName: @"AdjDateFrom"]];
			self.AdjDateThru = [Soap dateFromString: [Soap getNodeValue: node withName: @"AdjDateThru"]];
			self.TidalAdj = [[Soap getNodeValue: node withName: @"TidalAdj"] boolValue];
			self.EventID = [[Soap getNodeValue: node withName: @"EventID"] intValue];
			self.EventDescription = [Soap getNodeValue: node withName: @"EventDescription"];
			self.DepArrIndicator = [Soap getNodeValue: node withName: @"DepArrIndicator"];
			self.AdjType = [Soap getNodeValue: node withName: @"AdjType"];
			self.Annotations = [[WSFArrayOfSchedAnnotation createWithNode: [Soap getNode: node withName: @"Annotations"]] object];
		}
		return self;
	}

	- (NSMutableString*) serialize
	{
		return [self serialize: @"SchedTimeAdjResponse"];
	}
  
	- (NSMutableString*) serialize: (NSString*) nodeName
	{
		NSMutableString* s = [NSMutableString string];
		[s appendFormat: @"<%@", nodeName];
		[s appendString: [self serializeAttributes]];
		[s appendString: @">"];
		[s appendString: [self serializeElements]];
		[s appendFormat: @"</%@>", nodeName];
		return s;
	}
	
	- (NSMutableString*) serializeElements
	{
		NSMutableString* s = [super serializeElements];
		[s appendFormat: @"<ScheduleID>%@</ScheduleID>", [NSString stringWithFormat: @"%i", self.ScheduleID]];
		[s appendFormat: @"<SchedRouteID>%@</SchedRouteID>", [NSString stringWithFormat: @"%i", self.SchedRouteID]];
		[s appendFormat: @"<RouteID>%@</RouteID>", [NSString stringWithFormat: @"%i", self.RouteID]];
		if (self.RouteDescription != nil) [s appendFormat: @"<RouteDescription>%@</RouteDescription>", [[self.RouteDescription stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		[s appendFormat: @"<RouteSortSeq>%@</RouteSortSeq>", [NSString stringWithFormat: @"%i", self.RouteSortSeq]];
		[s appendFormat: @"<SailingID>%@</SailingID>", [NSString stringWithFormat: @"%i", self.SailingID]];
		if (self.SailingDescription != nil) [s appendFormat: @"<SailingDescription>%@</SailingDescription>", [[self.SailingDescription stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.ActiveSailingDateRange != nil) [s appendString: [self.ActiveSailingDateRange serialize: @"ActiveSailingDateRange"]];
		if (self.SailingDir != nil) [s appendFormat: @"<SailingDir>%@</SailingDir>", [[self.SailingDir stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		[s appendFormat: @"<JourneyID>%@</JourneyID>", [NSString stringWithFormat: @"%i", self.JourneyID]];
		[s appendFormat: @"<VesselID>%@</VesselID>", [NSString stringWithFormat: @"%i", self.VesselID]];
		if (self.VesselName != nil) [s appendFormat: @"<VesselName>%@</VesselName>", [[self.VesselName stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		[s appendFormat: @"<VesselHandicapAccessible>%@</VesselHandicapAccessible>", (self.VesselHandicapAccessible)?@"true":@"false"];
		[s appendFormat: @"<VesselPositionNum>%@</VesselPositionNum>", [NSString stringWithFormat: @"%i", self.VesselPositionNum]];
		[s appendFormat: @"<JourneyTerminalID>%@</JourneyTerminalID>", [NSString stringWithFormat: @"%i", self.JourneyTerminalID]];
		[s appendFormat: @"<TerminalID>%@</TerminalID>", [NSString stringWithFormat: @"%i", self.TerminalID]];
		if (self.TerminalDescription != nil) [s appendFormat: @"<TerminalDescription>%@</TerminalDescription>", [[self.TerminalDescription stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.TerminalBriefDescription != nil) [s appendFormat: @"<TerminalBriefDescription>%@</TerminalBriefDescription>", [[self.TerminalBriefDescription stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.TimeToAdj != nil) [s appendFormat: @"<TimeToAdj>%@</TimeToAdj>", [Soap getDateString: self.TimeToAdj]];
		if (self.AdjDateFrom != nil) [s appendFormat: @"<AdjDateFrom>%@</AdjDateFrom>", [Soap getDateString: self.AdjDateFrom]];
		if (self.AdjDateThru != nil) [s appendFormat: @"<AdjDateThru>%@</AdjDateThru>", [Soap getDateString: self.AdjDateThru]];
		[s appendFormat: @"<TidalAdj>%@</TidalAdj>", (self.TidalAdj)?@"true":@"false"];
		[s appendFormat: @"<EventID>%@</EventID>", [NSString stringWithFormat: @"%i", self.EventID]];
		if (self.EventDescription != nil) [s appendFormat: @"<EventDescription>%@</EventDescription>", [[self.EventDescription stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.DepArrIndicator != nil) [s appendFormat: @"<DepArrIndicator>%@</DepArrIndicator>", [[self.DepArrIndicator stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.AdjType != nil) [s appendFormat: @"<AdjType>%@</AdjType>", [[self.AdjType stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.Annotations != nil && self.Annotations.count > 0) {
			[s appendFormat: @"<Annotations>%@</Annotations>", [WSFArrayOfSchedAnnotation serialize: self.Annotations]];
		} else {
			[s appendString: @"<Annotations/>"];
		}

		return s;
	}
	
	- (NSMutableString*) serializeAttributes
	{
		NSMutableString* s = [super serializeAttributes];

		return s;
	}
	
	-(BOOL)isEqual:(id)object{
		if(object != nil && [object isKindOfClass:[WSFSchedTimeAdjResponse class]]) {
			return [[self serialize] isEqualToString:[object serialize]];
		}
		return NO;
	}
	
	-(NSUInteger)hash{
		return [Soap generateHash:self];

	}

@end
