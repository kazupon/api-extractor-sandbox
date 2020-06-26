# Class

## Calculator

Calculator class

**Signature:**
```typescript
export declare class Calculator implements Calculatable 
```

### Remarks

This is remarks of Calculator class

### Examples


```javascript
const c = new Calculator()
const v1 = c.add(1, 1)
const v2 = c.sub(1, 1)
```



### Constructor

Conssutructor of usage

**Signature:**
```typescript
constructor(type: string);
```


### Methods

#### add

add method

**Signature:**
```typescript
add(a: number, b: number): number;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| a | number | target 1 
| b | number | target 2 

#### sub

sub method

**Signature:**
```typescript
sub(a: number, b: number): number;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| a | number | target 1 
| b | number | target 2 


### Properties

#### PI

PI

**Signature:**
```typescript
PI: number;
```

#### type

calcurator types

 'simple'

**Signature:**
```typescript
type: string;
```


