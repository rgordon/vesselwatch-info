/*
	WSFRouteResponse.h
	The interface definition of properties and methods for the WSFRouteResponse object.
	Generated by SudzC.com
*/

#import "Soap.h"
	
@class WSFArrayOfRouteAlert;

@interface WSFRouteResponse : SoapObject
{
	int _RouteID;
	NSString* _RouteAbbrev;
	NSString* _Description;
	int _RegionID;
	int _VesselWatchID;
	BOOL _ReservationFlag;
	BOOL _InternationalFlag;
	BOOL _PassengerOnlyFlag;
	NSString* _CrossingTime;
	NSString* _AdaNotes;
	NSString* _GeneralRouteNotes;
	NSString* _SeasonalRouteNotes;
	NSMutableArray* _Alerts;
	
}
		
	@property int RouteID;
	@property (retain, nonatomic) NSString* RouteAbbrev;
	@property (retain, nonatomic) NSString* Description;
	@property int RegionID;
	@property int VesselWatchID;
	@property BOOL ReservationFlag;
	@property BOOL InternationalFlag;
	@property BOOL PassengerOnlyFlag;
	@property (retain, nonatomic) NSString* CrossingTime;
	@property (retain, nonatomic) NSString* AdaNotes;
	@property (retain, nonatomic) NSString* GeneralRouteNotes;
	@property (retain, nonatomic) NSString* SeasonalRouteNotes;
	@property (retain, nonatomic) NSMutableArray* Alerts;

	+ (WSFRouteResponse*) createWithNode: (CXMLNode*) node;
	- (id) initWithNode: (CXMLNode*) node;
	- (NSMutableString*) serialize;
	- (NSMutableString*) serialize: (NSString*) nodeName;
	- (NSMutableString*) serializeAttributes;
	- (NSMutableString*) serializeElements;

@end