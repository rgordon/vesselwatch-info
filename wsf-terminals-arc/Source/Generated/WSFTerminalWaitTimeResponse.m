/*
	WSFTerminalWaitTimeResponse.h
	The implementation of properties and methods for the WSFTerminalWaitTimeResponse object.
	Generated by SudzC.com
*/
#import "WSFTerminalWaitTimeResponse.h"

#import "WSFArrayOfWaitTime.h"
@implementation WSFTerminalWaitTimeResponse
	@synthesize TerminalID = _TerminalID;
	@synthesize TerminalSubjectID = _TerminalSubjectID;
	@synthesize RegionID = _RegionID;
	@synthesize TerminalName = _TerminalName;
	@synthesize TerminalAbbrev = _TerminalAbbrev;
	@synthesize SortSeq = _SortSeq;
	@synthesize WaitTimes = _WaitTimes;

	- (id) init
	{
		if(self = [super init])
		{
			self.TerminalName = nil;
			self.TerminalAbbrev = nil;
			self.WaitTimes = [[NSMutableArray alloc] init];

		}
		return self;
	}

	+ (WSFTerminalWaitTimeResponse*) createWithNode: (CXMLNode*) node
	{
		if(node == nil) { return nil; }
		return (WSFTerminalWaitTimeResponse*)[[WSFTerminalWaitTimeResponse alloc] initWithNode: node];
	}

	- (id) initWithNode: (CXMLNode*) node {
		if(self = [super initWithNode: node])
		{
			self.TerminalID = [[Soap getNodeValue: node withName: @"TerminalID"] intValue];
			self.TerminalSubjectID = [[Soap getNodeValue: node withName: @"TerminalSubjectID"] intValue];
			self.RegionID = [[Soap getNodeValue: node withName: @"RegionID"] intValue];
			self.TerminalName = [Soap getNodeValue: node withName: @"TerminalName"];
			self.TerminalAbbrev = [Soap getNodeValue: node withName: @"TerminalAbbrev"];
			self.SortSeq = [[Soap getNodeValue: node withName: @"SortSeq"] intValue];
			self.WaitTimes = [[WSFArrayOfWaitTime createWithNode: [Soap getNode: node withName: @"WaitTimes"]] object];
		}
		return self;
	}

	- (NSMutableString*) serialize
	{
		return [self serialize: @"TerminalWaitTimeResponse"];
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
		[s appendFormat: @"<TerminalID>%@</TerminalID>", [NSString stringWithFormat: @"%i", self.TerminalID]];
		[s appendFormat: @"<TerminalSubjectID>%@</TerminalSubjectID>", [NSString stringWithFormat: @"%i", self.TerminalSubjectID]];
		[s appendFormat: @"<RegionID>%@</RegionID>", [NSString stringWithFormat: @"%i", self.RegionID]];
		if (self.TerminalName != nil) [s appendFormat: @"<TerminalName>%@</TerminalName>", [[self.TerminalName stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		if (self.TerminalAbbrev != nil) [s appendFormat: @"<TerminalAbbrev>%@</TerminalAbbrev>", [[self.TerminalAbbrev stringByReplacingOccurrencesOfString:@"\"" withString:@"&quot;"] stringByReplacingOccurrencesOfString:@"&" withString:@"&amp;"]];
		[s appendFormat: @"<SortSeq>%@</SortSeq>", [NSString stringWithFormat: @"%i", self.SortSeq]];
		if (self.WaitTimes != nil && self.WaitTimes.count > 0) {
			[s appendFormat: @"<WaitTimes>%@</WaitTimes>", [WSFArrayOfWaitTime serialize: self.WaitTimes]];
		} else {
			[s appendString: @"<WaitTimes/>"];
		}

		return s;
	}
	
	- (NSMutableString*) serializeAttributes
	{
		NSMutableString* s = [super serializeAttributes];

		return s;
	}
	
	-(BOOL)isEqual:(id)object{
		if(object != nil && [object isKindOfClass:[WSFTerminalWaitTimeResponse class]]) {
			return [[self serialize] isEqualToString:[object serialize]];
		}
		return NO;
	}
	
	-(NSUInteger)hash{
		return [Soap generateHash:self];

	}

@end
