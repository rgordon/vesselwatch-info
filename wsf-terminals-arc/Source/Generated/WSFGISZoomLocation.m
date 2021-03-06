/*
	WSFGISZoomLocation.h
	The implementation of properties and methods for the WSFGISZoomLocation object.
	Generated by SudzC.com
*/
#import "WSFGISZoomLocation.h"

@implementation WSFGISZoomLocation
	@synthesize ZoomLevel = _ZoomLevel;
	@synthesize Latitude = _Latitude;
	@synthesize Longitude = _Longitude;

	- (id) init
	{
		if(self = [super init])
		{

		}
		return self;
	}

	+ (WSFGISZoomLocation*) createWithNode: (CXMLNode*) node
	{
		if(node == nil) { return nil; }
		return (WSFGISZoomLocation*)[[WSFGISZoomLocation alloc] initWithNode: node];
	}

	- (id) initWithNode: (CXMLNode*) node {
		if(self = [super initWithNode: node])
		{
			self.ZoomLevel = [[Soap getNodeValue: node withName: @"ZoomLevel"] intValue];
			self.Latitude = [[Soap getNodeValue: node withName: @"Latitude"] doubleValue];
			self.Longitude = [[Soap getNodeValue: node withName: @"Longitude"] doubleValue];
		}
		return self;
	}

	- (NSMutableString*) serialize
	{
		return [self serialize: @"GISZoomLocation"];
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
		[s appendFormat: @"<ZoomLevel>%@</ZoomLevel>", [NSString stringWithFormat: @"%i", self.ZoomLevel]];
		[s appendFormat: @"<Latitude>%@</Latitude>", [NSString stringWithFormat: @"%f", self.Latitude]];
		[s appendFormat: @"<Longitude>%@</Longitude>", [NSString stringWithFormat: @"%f", self.Longitude]];

		return s;
	}
	
	- (NSMutableString*) serializeAttributes
	{
		NSMutableString* s = [super serializeAttributes];

		return s;
	}
	
	-(BOOL)isEqual:(id)object{
		if(object != nil && [object isKindOfClass:[WSFGISZoomLocation class]]) {
			return [[self serialize] isEqualToString:[object serialize]];
		}
		return NO;
	}
	
	-(NSUInteger)hash{
		return [Soap generateHash:self];

	}

@end
