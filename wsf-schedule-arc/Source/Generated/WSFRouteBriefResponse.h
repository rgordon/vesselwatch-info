/*
	WSFRouteBriefResponse.h
	The interface definition of properties and methods for the WSFRouteBriefResponse object.
	Generated by SudzC.com
*/

#import "Soap.h"
	
@class WSFArrayOfRouteBriefAlert;

@interface WSFRouteBriefResponse : SoapObject
{
	int _RouteID;
	NSString* _RouteAbbrev;
	NSString* _Description;
	int _RegionID;
	NSMutableArray* _ServiceDisruptions;
	
}
		
	@property int RouteID;
	@property (retain, nonatomic) NSString* RouteAbbrev;
	@property (retain, nonatomic) NSString* Description;
	@property int RegionID;
	@property (retain, nonatomic) NSMutableArray* ServiceDisruptions;

	+ (WSFRouteBriefResponse*) createWithNode: (CXMLNode*) node;
	- (id) initWithNode: (CXMLNode*) node;
	- (NSMutableString*) serialize;
	- (NSMutableString*) serialize: (NSString*) nodeName;
	- (NSMutableString*) serializeAttributes;
	- (NSMutableString*) serializeElements;

@end
