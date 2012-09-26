/*
	WSFTerminalComboMsg.h
	The interface definition of properties and methods for the WSFTerminalComboMsg object.
	Generated by SudzC.com
*/

#import "Soap.h"
	

@interface WSFTerminalComboMsg : SoapObject
{
	NSDate* _TripDate;
	int _DepartingTerminalID;
	int _ArrivingTerminalID;
	
}
		
	@property (retain, nonatomic) NSDate* TripDate;
	@property int DepartingTerminalID;
	@property int ArrivingTerminalID;

	+ (WSFTerminalComboMsg*) createWithNode: (CXMLNode*) node;
	- (id) initWithNode: (CXMLNode*) node;
	- (NSMutableString*) serialize;
	- (NSMutableString*) serialize: (NSString*) nodeName;
	- (NSMutableString*) serializeAttributes;
	- (NSMutableString*) serializeElements;

@end