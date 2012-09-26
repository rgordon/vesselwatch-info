/*
	WSFTerminalVerboseResponse.h
	The interface definition of properties and methods for the WSFTerminalVerboseResponse object.
	Generated by SudzC.com
*/

#import "Soap.h"
	
@class WSFArrayOfGISZoomLocation;
@class WSFArrayOfLink;
@class WSFArrayOfWaitTime;
@class WSFLink;
@class WSFArrayOfLink;
@class WSFArrayOfBulletin;

@interface WSFTerminalVerboseResponse : SoapObject
{
	int _TerminalID;
	int _TerminalSubjectID;
	int _RegionID;
	NSString* _TerminalName;
	NSString* _TerminalAbbrev;
	int _SortSeq;
	BOOL _OverheadPassengerLoading;
	BOOL _Elevator;
	BOOL _WaitingRoom;
	BOOL _FoodService;
	BOOL _Restroom;
	double _Latitude;
	double _Longitude;
	NSString* _AddressLineOne;
	NSString* _AddressLineTwo;
	NSString* _City;
	NSString* _State;
	NSString* _ZipCode;
	NSString* _Country;
	NSString* _MapLink;
	NSString* _Directions;
	NSMutableArray* _DispGISZoomLoc;
	NSString* _ParkingInfo;
	NSString* _ParkingShuttleInfo;
	NSString* _AirportInfo;
	NSString* _AirportShuttleInfo;
	NSString* _MotorcycleInfo;
	NSString* _TruckInfo;
	NSString* _BikeInfo;
	NSString* _TrainInfo;
	NSString* _TaxiInfo;
	NSString* _HovInfo;
	NSMutableArray* _TransitLinks;
	NSMutableArray* _WaitTimes;
	NSString* _AdditionalInfo;
	NSString* _LostAndFoundInfo;
	NSString* _SecurityInfo;
	NSString* _ConstructionInfo;
	NSString* _FoodServiceInfo;
	NSString* _AdaInfo;
	NSString* _FareDiscountInfo;
	NSString* _TallySystemInfo;
	WSFLink* _ChamberOfCommerce;
	NSString* _FacInfo;
	NSString* _ResourceStatus;
	NSString* _TypeDesc;
	NSMutableArray* _VisitorLinks;
	NSMutableArray* _Bulletins;
	
}
		
	@property int TerminalID;
	@property int TerminalSubjectID;
	@property int RegionID;
	@property (retain, nonatomic) NSString* TerminalName;
	@property (retain, nonatomic) NSString* TerminalAbbrev;
	@property int SortSeq;
	@property BOOL OverheadPassengerLoading;
	@property BOOL Elevator;
	@property BOOL WaitingRoom;
	@property BOOL FoodService;
	@property BOOL Restroom;
	@property double Latitude;
	@property double Longitude;
	@property (retain, nonatomic) NSString* AddressLineOne;
	@property (retain, nonatomic) NSString* AddressLineTwo;
	@property (retain, nonatomic) NSString* City;
	@property (retain, nonatomic) NSString* State;
	@property (retain, nonatomic) NSString* ZipCode;
	@property (retain, nonatomic) NSString* Country;
	@property (retain, nonatomic) NSString* MapLink;
	@property (retain, nonatomic) NSString* Directions;
	@property (retain, nonatomic) NSMutableArray* DispGISZoomLoc;
	@property (retain, nonatomic) NSString* ParkingInfo;
	@property (retain, nonatomic) NSString* ParkingShuttleInfo;
	@property (retain, nonatomic) NSString* AirportInfo;
	@property (retain, nonatomic) NSString* AirportShuttleInfo;
	@property (retain, nonatomic) NSString* MotorcycleInfo;
	@property (retain, nonatomic) NSString* TruckInfo;
	@property (retain, nonatomic) NSString* BikeInfo;
	@property (retain, nonatomic) NSString* TrainInfo;
	@property (retain, nonatomic) NSString* TaxiInfo;
	@property (retain, nonatomic) NSString* HovInfo;
	@property (retain, nonatomic) NSMutableArray* TransitLinks;
	@property (retain, nonatomic) NSMutableArray* WaitTimes;
	@property (retain, nonatomic) NSString* AdditionalInfo;
	@property (retain, nonatomic) NSString* LostAndFoundInfo;
	@property (retain, nonatomic) NSString* SecurityInfo;
	@property (retain, nonatomic) NSString* ConstructionInfo;
	@property (retain, nonatomic) NSString* FoodServiceInfo;
	@property (retain, nonatomic) NSString* AdaInfo;
	@property (retain, nonatomic) NSString* FareDiscountInfo;
	@property (retain, nonatomic) NSString* TallySystemInfo;
	@property (retain, nonatomic) WSFLink* ChamberOfCommerce;
	@property (retain, nonatomic) NSString* FacInfo;
	@property (retain, nonatomic) NSString* ResourceStatus;
	@property (retain, nonatomic) NSString* TypeDesc;
	@property (retain, nonatomic) NSMutableArray* VisitorLinks;
	@property (retain, nonatomic) NSMutableArray* Bulletins;

	+ (WSFTerminalVerboseResponse*) createWithNode: (CXMLNode*) node;
	- (id) initWithNode: (CXMLNode*) node;
	- (NSMutableString*) serialize;
	- (NSMutableString*) serialize: (NSString*) nodeName;
	- (NSMutableString*) serializeAttributes;
	- (NSMutableString*) serializeElements;

@end